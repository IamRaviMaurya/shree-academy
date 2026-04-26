import { BookRecord, InventoryBook } from '../types';

const getStorageKey = (teacherId: string, key: string): string => {
  return `sa_${teacherId}_${key}`;
};

export const loadRecords = (teacherId: string): BookRecord[] => {
  try {
    const saved = localStorage.getItem(getStorageKey(teacherId, 'records'));
    if (!saved) return [];

    const records = JSON.parse(saved);
    // Migrate existing records to include paymentStatus if missing
    return records.map((record: any) => ({
      ...record,
      paymentStatus: record.paymentStatus || 'pending',
    }));
  } catch (error) {
    console.error('Error loading records:', error);
    return [];
  }
};

export const saveRecords = (teacherId: string, records: BookRecord[]): void => {
  try {
    localStorage.setItem(getStorageKey(teacherId, 'records'), JSON.stringify(records));
  } catch (error) {
    console.error('Error saving records:', error);
  }
};

export const loadNextId = (teacherId: string): number => {
  try {
    const saved = localStorage.getItem(getStorageKey(teacherId, 'nextid'));
    return saved ? parseInt(saved, 10) : 1;
  } catch (error) {
    console.error('Error loading next ID:', error);
    return 1;
  }
};

export const saveNextId = (teacherId: string, nextId: number): void => {
  try {
    localStorage.setItem(getStorageKey(teacherId, 'nextid'), String(nextId));
  } catch (error) {
    console.error('Error saving next ID:', error);
  }
};

export const loadInventory = (teacherId: string): InventoryBook[] => {
  try {
    const saved = localStorage.getItem(getStorageKey(teacherId, 'inventory'));
    if (!saved) return [];
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading inventory:', error);
    return [];
  }
};

export const saveInventory = (teacherId: string, inventory: InventoryBook[]): void => {
  try {
    localStorage.setItem(getStorageKey(teacherId, 'inventory'), JSON.stringify(inventory));
  } catch (error) {
    console.error('Error saving inventory:', error);
  }
};

// Legacy functions for backward compatibility (without teacher ID)
const RECORDS_KEY = 'sa_records_v2';
const NEXT_ID_KEY = 'sa_nextid_v2';

export const loadLegacyRecords = (): BookRecord[] => {
  try {
    const saved = localStorage.getItem(RECORDS_KEY);
    if (!saved) return [];

    const records = JSON.parse(saved);
    // Migrate legacy records to include paymentStatus and teacherId if missing
    return records.map((record: any) => ({
      ...record,
      paymentStatus: record.paymentStatus || 'pending',
      teacherId: record.teacherId || 'unknown', // Will be overridden when migrated
    }));
  } catch (error) {
    console.error('Error loading legacy records:', error);
    return [];
  }
};

export const loadLegacyNextId = (): number => {
  try {
    const saved = localStorage.getItem(NEXT_ID_KEY);
    return saved ? parseInt(saved, 10) : 1;
  } catch (error) {
    console.error('Error loading legacy next ID:', error);
    return 1;
  }
};