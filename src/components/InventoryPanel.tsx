import React, { useState } from 'react';
import { InventoryBook, BookCategory } from '../types';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Select } from './Select';
import { useInventory } from '../hooks/useInventory';

interface InventoryPanelProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ onShowToast }) => {
  const { books, classes, addBook, updateBook, deleteBook } = useInventory();
  
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  
  const [newClass, setNewClass] = useState('');
  const [selectedClass, setSelectedClass] = useState(classes[0] || '');
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'textbook' as BookCategory,
    supplier: '',
  });

  const handleEdit = (book: InventoryBook) => {
    setEditingBookId(book.id);
    setFormData({
      title: book.title,
      price: book.price.toString(),
      category: book.category,
      supplier: book.supplier || '',
    });
  };

  const handleAddClass = () => {
    if (newClass.trim()) {
      if (!classes.includes(newClass.trim())) {
        setSelectedClass(newClass.trim());
      }
      setNewClass('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      onShowToast('Pehle ek class select ya add karein.', 'error');
      return;
    }
    if (!formData.title.trim() || !formData.price) {
      onShowToast('Book title aur price required hai.', 'error');
      return;
    }

    if (editingBookId) {
      updateBook(editingBookId, {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        supplier: formData.supplier.trim() || undefined,
      });
      setEditingBookId(null);
      setFormData({ title: '', price: '', category: 'textbook', supplier: '' });
      onShowToast('Book updated successfully!', 'success');
    } else {
      addBook({
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        cls: selectedClass,
        supplier: formData.supplier.trim() || undefined,
      });
      setFormData({ title: '', price: '', category: 'textbook', supplier: '' });
      onShowToast('Book add ho gayi inventory mein!', 'success');
    }
  };

  const classBooks = books.filter(b => b.cls === selectedClass);

  return (
    <div className="space-y-6">
      <Card title="Manage Classes">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Select
              label="Select Class to Manage"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'Select a class...' },
                ...classes.map(c => ({ value: c, label: c }))
              ]}
            />
          </div>
          <div className="flex-1 w-full flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Or Add New Class"
                placeholder="e.g. 9th"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
              />
            </div>
            <Button type="button" onClick={handleAddClass} variant="default">
              Add
            </Button>
          </div>
        </div>
      </Card>

      {selectedClass && (
        <Card title={editingBookId ? `Edit Book in ${selectedClass}` : `Add Book to ${selectedClass}`}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Book Title *"
              placeholder="e.g. Science Textbook"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              label="Price (₹) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="100"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as BookCategory })}
              options={[
                { value: 'textbook', label: 'Textbook' },
                { value: 'workbook', label: 'Workbook' },
                { value: 'notebook', label: 'Notebook' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input
              label="Supplier (Optional)"
              placeholder="e.g. Navneet, Govt."
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" variant="primary">
                {editingBookId ? 'Save Changes' : '+ Add Book'}
              </Button>
              {editingBookId && (
                <Button type="button" variant="default" onClick={() => {
                  setEditingBookId(null);
                  setFormData({ title: '', price: '', category: 'textbook', supplier: '' });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {selectedClass && classBooks.length > 0 && (
        <Card title={`Current Books in ${selectedClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classBooks.map((book) => (
                  <tr key={book.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{book.title}</td>
                    <td className="px-4 py-3 capitalize">{book.category}</td>
                    <td className="px-4 py-3">₹{book.price}</td>
                    <td className="px-4 py-3">{book.supplier || '-'}</td>
                    <td className="px-4 py-3 text-right space-x-4">
                      <button
                        onClick={() => handleEdit(book)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this book?')) {
                            deleteBook(book.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
