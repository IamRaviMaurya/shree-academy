export interface Teacher {
  id: string;
  name: string;
  username: string;
  password: string;
  subject?: string;
  upiId?: string;
}

export interface BookRecord {
  id: number;
  teacherId: string; // Added teacher ID
  book: string;
  price: number;
  qty: number;
  student: string;
  contactNumber?: string;
  cls: string;
  date: string;
  ret: string;
  notes: string;
  paymentStatus: 'cash' | 'pending' | 'online';
  supplier?: string;
}

export interface Stats {
  totalRecords: number;
  totalBooks: number;
  totalStudents: number;
  totalValue: number;
}

export interface FormData {
  book: string;
  price: string;
  qty: string;
  student: string;
  contactNumber: string;
  cls: string;
  date: string;
  ret: string;
  notes: string;
  paymentStatus: 'cash' | 'pending' | 'online';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export type BookCategory = 'textbook' | 'workbook' | 'notebook' | 'other';

export interface InventoryBook {
  id: string;
  title: string;
  price: number;
  category: BookCategory;
  cls: string;
  supplier?: string;
}

export type TabType = 'add' | 'records' | 'inventory' | 'excel';