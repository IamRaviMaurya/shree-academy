import React, { useState, useEffect } from 'react';
import { BookRecord } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

interface EditRecordModalProps {
  record: BookRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updates: Partial<BookRecord>) => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    paymentStatus: 'pending' as 'pending' | 'cash' | 'online',
    contactNumber: '',
    notes: '',
    date: '',
    ret: '',
  });

  // Update form data when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        paymentStatus: record.paymentStatus || 'pending',
        contactNumber: record.contactNumber || '',
        notes: record.notes || '',
        date: record.date || '',
        ret: record.ret || '',
      });
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    const updates: Partial<BookRecord> = {};
    if (formData.paymentStatus !== record.paymentStatus) {
      updates.paymentStatus = formData.paymentStatus;
    }
    if (formData.contactNumber !== (record.contactNumber || '')) {
      updates.contactNumber = formData.contactNumber || undefined;
    }
    if (formData.notes !== (record.notes || '')) {
      updates.notes = formData.notes || undefined;
    }
    if (formData.date !== (record.date || '')) {
      updates.date = formData.date || undefined;
    }
    if (formData.ret !== (record.ret || '')) {
      updates.ret = formData.ret || undefined;
    }

    if (Object.keys(updates).length > 0) {
      onSave(record.id, updates);
    }
    onClose();
  };

  const handleClose = () => {
    setFormData({
      paymentStatus: 'pending',
      contactNumber: '',
      notes: '',
      date: '',
      ret: '',
    });
    onClose();
  };

  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Record"
      actions={
        <>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <Input
              value={record.student}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Book
            </label>
            <Input
              value={record.book}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <Input
              value={record.cls || ''}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <Input
              value={formData.contactNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status *
            </label>
            <Select
              value={formData.paymentStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as 'pending' | 'cash' | 'online' }))}
              options={[
                { value: 'pending', label: '⏳ Pending' },
                { value: 'cash', label: '💰 Cash' },
                { value: 'online', label: '💳 Online' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return Date
            </label>
            <Input
              type="date"
              value={formData.ret}
              onChange={(e) => setFormData(prev => ({ ...prev, ret: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            placeholder="Add any additional notes..."
          />
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Note:</strong> Only payment status, dates, and notes can be edited. Core information like student name, book, and price cannot be changed.
        </div>
      </form>
    </Modal>
  );
};