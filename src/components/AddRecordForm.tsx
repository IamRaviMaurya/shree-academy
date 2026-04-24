import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BookRecord, FormData } from '../types';
import { getTodayString, calculateTotal } from '../utils/helpers';
import { classOptions, getFixedBookOptionsForClass } from '../utils/fixedBooks';
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
          cls: '',
          date: getTodayString(),
          ret: '',
          notes: '',
          paymentStatus: 'pending',
        });
      }
      setSelectedBookIds([]);
      setTotal('');
    },
  }));
  const [formData, setFormData] = useState<FormData>({
    book: '',
    price: '',
    qty: '1',
    student: '',
    cls: '',
    date: getTodayString(),
    ret: '',
    notes: '',
    paymentStatus: 'pending',
  });

  const [total, setTotal] = useState<string>('');
  const [keepStudentInfo, setKeepStudentInfo] = useState<boolean>(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  // Calculate total when price, quantity, or selected fixed books change
  useEffect(() => {
    const selectedClassBooks = getFixedBookOptionsForClass(formData.cls);
    const selectedBooks = selectedClassBooks.filter(book => selectedBookIds.includes(book.id));

    if (selectedBooks.length > 0) {
      const calculatedTotal = selectedBooks.reduce((sum, book) => sum + book.price, 0);
      setTotal(calculatedTotal > 0 ? calculatedTotal.toFixed(2) : '');
      return;
    }

    const price = parseFloat(formData.price) || 0;
    const qty = parseInt(formData.qty) || 0;
    const calculatedTotal = calculateTotal(price, qty);
    setTotal(calculatedTotal > 0 ? calculatedTotal.toFixed(2) : '');
  }, [formData.price, formData.qty, formData.cls, selectedBookIds]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'cls') {
      setSelectedBookIds([]);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedClassBooks = getFixedBookOptionsForClass(formData.cls);
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
        recordsToAdd.push({
          book: book.title,
          price: book.price,
          qty: 1,
          student: formData.student.trim(),
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

          <Select
            label="Class / Grade"
            value={formData.cls}
            onChange={(e) => handleInputChange('cls', e.target.value)}
            options={classOptions}
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
                    label: `${book.title} — ₹${book.price} — ${book.supplier}`,
                  }))}
                />
              </div>

              {selectedBooks.length > 0 && (
                <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                  <div className="font-semibold text-gray-700 mb-2">Selected Books</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedBooks.map(book => (
                      <li key={book.id}>
                        {book.title} — ₹{book.price} — {book.supplier}
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