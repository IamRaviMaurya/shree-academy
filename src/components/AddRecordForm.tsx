import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BookRecord, FormData } from '../types';
import { getTodayString, calculateTotal } from '../utils/helpers';
import { useInventory } from '../hooks/useInventory';
import { Card } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';

interface AddRecordFormProps {
  onAddRecord: (records: Omit<BookRecord, 'id' | 'teacherId'>[], keepStudentInfo: boolean) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onResetForm?: (keepStudent: boolean) => void;
}

export const AddRecordForm = forwardRef<{ resetForm: (keepStudent: boolean) => void }, AddRecordFormProps>(({
  onAddRecord,
  onShowToast,
  onResetForm,
}, ref) => {
  useImperativeHandle(ref, () => ({
    resetForm: (keepStudent: boolean) => {
      if (keepStudent) {
        setFormData(prev => ({
          ...prev,
          book: '',
          price: '',
          qty: '1',
          contactNumber: '',
          date: getTodayString(),
          ret: '',
          notes: '',
          paymentStatus: 'pending',
        }));
      } else {
        setFormData({
          book: '',
          price: '',
          qty: '1',
          student: '',
          contactNumber: '',
          cls: '',
          date: getTodayString(),
          ret: '',
          notes: '',
          paymentStatus: 'pending',
        });
      }
      setSelectedBookIds([]);
      setBookQuantities({});
      setTotal('');
    },
  }));
  const [formData, setFormData] = useState<FormData>({
    book: '',
    price: '',
    qty: '1',
    student: '',
    contactNumber: '',
    cls: '',
    date: getTodayString(),
    ret: '',
    notes: '',
    paymentStatus: 'pending',
  });

  const { classes, getBooksByClass } = useInventory();

  const [total, setTotal] = useState<string>('');
  const [keepStudentInfo, setKeepStudentInfo] = useState<boolean>(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [bookQuantities, setBookQuantities] = useState<Record<string, number>>({});

  // Calculate total when price, quantity, or selected fixed books change
  useEffect(() => {
    const selectedClassBooks = getBooksByClass(formData.cls);
    const selectedBooks = selectedClassBooks.filter(book => selectedBookIds.includes(book.id));

    if (selectedBooks.length > 0) {
      const calculatedTotal = selectedBooks.reduce((sum, book) => {
        const qty = bookQuantities[book.id] || 1;
        return sum + (book.price * qty);
      }, 0);
      setTotal(calculatedTotal > 0 ? calculatedTotal.toFixed(2) : '');
      return;
    }

    const price = parseFloat(formData.price) || 0;
    const qty = parseInt(formData.qty) || 0;
    const calculatedTotal = calculateTotal(price, qty);
    setTotal(calculatedTotal > 0 ? calculatedTotal.toFixed(2) : '');
  }, [formData.price, formData.qty, formData.cls, selectedBookIds, bookQuantities, getBooksByClass]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'cls') {
      setSelectedBookIds([]);
      setBookQuantities({});
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedClassBooks = getBooksByClass(formData.cls);
  const selectedBooks = selectedClassBooks.filter(book => selectedBookIds.includes(book.id));
  const useFixedBooks = selectedClassBooks.length > 0;

  const handleBookSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedBookIds(selected);
  };

  const validateForm = (): boolean => {
    if (useFixedBooks && selectedBooks.length === 0) {
      onShowToast('Kripya class ke liye ek ya adhik books select karein.', 'error');
      return false;
    }

    if (!useFixedBooks && !formData.book.trim()) {
      onShowToast('Book name required hai!', 'error');
      return false;
    }

    if (!formData.student.trim()) {
      onShowToast('Student name required hai!', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const recordsToAdd: Omit<BookRecord, 'id' | 'teacherId'>[] = [];

    if (useFixedBooks) {
      for (const book of selectedBooks) {
        const bookQty = bookQuantities[book.id] || 1;
        recordsToAdd.push({
          book: book.title,
          price: book.price,
          qty: bookQty,
          student: formData.student.trim(),
          contactNumber: formData.contactNumber.trim() || undefined,
          cls: formData.cls.trim(),
          date: formData.date,
          ret: formData.ret,
          notes: formData.notes.trim(),
          paymentStatus: formData.paymentStatus,
          supplier: book.supplier,
        });
      }
    } else {
      recordsToAdd.push({
        book: formData.book.trim(),
        price: parseFloat(formData.price) || 0,
        qty: parseInt(formData.qty) || 1,
        student: formData.student.trim(),
        contactNumber: formData.contactNumber.trim() || undefined,
        cls: formData.cls.trim(),
        date: formData.date,
        ret: formData.ret,
        notes: formData.notes.trim(),
        paymentStatus: formData.paymentStatus,
      });
    }

    onAddRecord(recordsToAdd, keepStudentInfo);
  };

  return (
    <Card title="New Book Issue">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Student Name *"
            placeholder="e.g. Rahul Sharma"
            value={formData.student}
            onChange={(e) => handleInputChange('student', e.target.value)}
          />

          <Input
            label="Parents Contact (Optional)"
            placeholder="e.g. 9876543210"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
          />

          <Select
            label="Class / Grade"
            value={formData.cls}
            onChange={(e) => handleInputChange('cls', e.target.value)}
            options={[
              { value: '', label: 'Select class' },
              ...classes.map(c => ({ value: c, label: c }))
            ]}
          />

          {useFixedBooks ? (
            <>
              <div className="md:col-span-2">
                <Select
                  label={`Select books for ${formData.cls}`}
                  multiple
                  size={6}
                  value={selectedBookIds}
                  onChange={handleBookSelection}
                  options={selectedClassBooks.map(book => ({
                    value: book.id,
                    label: `[${book.category}] ${book.title} — ₹${book.price}${book.supplier ? ` — ${book.supplier}` : ''}`,
                  }))}
                />
              </div>

              {selectedBooks.length > 0 && (
                <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                  <div className="font-semibold text-gray-700 mb-2">Selected Books</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedBooks.map(book => (
                      <li key={book.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 gap-2 border-b border-gray-200 last:border-0">
                        <div>
                          <span className="capitalize font-medium">[{book.category}]</span> {book.title} — ₹{book.price}{book.supplier ? ` — ${book.supplier}` : ''}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 font-medium">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                            value={bookQuantities[book.id] || 1}
                            onChange={(e) => setBookQuantities(prev => ({ ...prev, [book.id]: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <Input
                label="Book Name *"
                placeholder="e.g. Mathematics Part 1"
                value={formData.book}
                onChange={(e) => handleInputChange('book', e.target.value)}
              />

              <Input
                label="Book Price (₹) *"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />

              <Input
                label="Quantity *"
                type="number"
                placeholder="1"
                min="1"
                value={formData.qty}
                onChange={(e) => handleInputChange('qty', e.target.value)}
              />
            </>
          )}

          <div className="md:col-span-2">
            <Input
              label="Total Amount (₹)"
              placeholder="Auto calculated"
              value={total}
              readOnly
              className="bg-gray-50 text-info-600 font-semibold"
            />
          </div>

          <Select
            label="Payment Status"
            value={formData.paymentStatus}
            onChange={(e) => handleInputChange('paymentStatus', e.target.value as 'cash' | 'pending' | 'online')}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'cash', label: 'Cash' },
              { value: 'online', label: 'Online' },
            ]}
          />

          <Input
            label="Issue Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
          />

          <Input
            label="Return Date"
            type="date"
            value={formData.ret}
            onChange={(e) => handleInputChange('ret', e.target.value)}
          />

          <div className="md:col-span-2">
            <Input
              label="Notes (optional)"
              placeholder="Koi bhi remark..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="keepStudentInfo"
            checked={keepStudentInfo}
            onChange={(e) => setKeepStudentInfo(e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="keepStudentInfo" className="text-sm text-gray-700">
            Same student ke liye aur book add karna hai
          </label>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button type="submit" variant="primary">
            + Add Record
          </Button>
          <Button type="button" onClick={() => onResetForm?.(false)}>
            ↺ Reset
          </Button>
        </div>
      </form>
    </Card>
  );
});