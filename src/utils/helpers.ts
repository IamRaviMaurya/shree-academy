import { BookRecord } from '../types';

export const formatPrice = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const calculateTotal = (price: number, qty: number): number => {
  return price * qty;
};

export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const generateInvoiceNumber = (id: number): string => {
  return `SA-${String(id).padStart(5, '0')}`;
};

export const calculateStats = (records: BookRecord[]) => {
  const totalRecords = records.length;
  const totalBooks = records.reduce((sum, record) => sum + (record.qty || 0), 0);
  const uniqueStudents = new Set(records.map(r => r.student.trim().toLowerCase()));
  const totalStudents = uniqueStudents.size;
  const totalValue = records.reduce(
    (sum, record) => sum + calculateTotal(record.price || 0, record.qty || 0),
    0
  );

  return {
    totalRecords,
    totalBooks,
    totalStudents,
    totalValue,
  };
};

export const filterRecords = (records: BookRecord[], query: string): BookRecord[] => {
  if (!query.trim()) return records;

  const lowerQuery = query.toLowerCase().trim();
  return records.filter(
    (record) =>
      record.student.toLowerCase().includes(lowerQuery) ||
      record.book.toLowerCase().includes(lowerQuery) ||
      record.cls.toLowerCase().includes(lowerQuery)
  );
};