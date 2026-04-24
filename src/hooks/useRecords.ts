import { useState, useEffect, useCallback } from 'react';
import { BookRecord, Stats } from '../types';
import { loadRecords, saveRecords, loadNextId, saveNextId, loadLegacyRecords, loadLegacyNextId } from '../utils/storage';
import { calculateStats } from '../utils/helpers';
import { useAuth } from './useAuth';

export const useRecords = () => {
  const { currentTeacher } = useAuth();
  const [records, setRecords] = useState<BookRecord[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [stats, setStats] = useState<Stats>({
    totalRecords: 0,
    totalBooks: 0,
    totalStudents: 0,
    totalValue: 0,
  });

  // Load data when teacher changes
  useEffect(() => {
    if (!currentTeacher) {
      setRecords([]);
      setNextId(1);
      setStats({
        totalRecords: 0,
        totalBooks: 0,
        totalStudents: 0,
        totalValue: 0,
      });
      return;
    }

    // Try to load teacher-specific data first
    let loadedRecords = loadRecords(currentTeacher.id);
    let loadedNextId = loadNextId(currentTeacher.id);

    // If no teacher-specific data, try to migrate legacy data
    if (loadedRecords.length === 0) {
      const legacyRecords = loadLegacyRecords();
      const legacyNextId = loadLegacyNextId();

      if (legacyRecords.length > 0) {
        // Migrate legacy records to current teacher
        const migratedRecords = legacyRecords.map(record => ({
          ...record,
          teacherId: currentTeacher.id,
        }));

        loadedRecords = migratedRecords;
        loadedNextId = legacyNextId;

        // Save migrated data
        saveRecords(currentTeacher.id, migratedRecords);
        saveNextId(currentTeacher.id, legacyNextId);
      }
    }

    setRecords(loadedRecords);
    setNextId(loadedNextId);
    setStats(calculateStats(loadedRecords));
  }, [currentTeacher]);

  // Update stats when records change
  useEffect(() => {
    setStats(calculateStats(records));
  }, [records]);

  const addRecords = useCallback((recordDataList: Omit<BookRecord, 'id' | 'teacherId'>[]) => {
    if (!currentTeacher) return;

    const existingKeys = new Set(records.map(record =>
      `${record.student.toLowerCase()}|${record.book.toLowerCase()}`
    ));

    const newRecords = recordDataList.map((recordData, index) => {
      const key = `${recordData.student.toLowerCase()}|${recordData.book.toLowerCase()}`;
      if (existingKeys.has(key)) {
        throw new Error(`"${recordData.book}" already issued to "${recordData.student}"`);
      }
      if (recordDataList.slice(0, index).some(previous =>
        previous.student.toLowerCase() === recordData.student.toLowerCase() &&
        previous.book.toLowerCase() === recordData.book.toLowerCase()
      )) {
        throw new Error(`Same book "${recordData.book}" selected more than once for "${recordData.student}"`);
      }
      existingKeys.add(key);

      return {
        ...recordData,
        id: nextId + index,
        teacherId: currentTeacher.id,
      };
    });

    const updatedRecords = [...records, ...newRecords];
    setRecords(updatedRecords);
    setNextId(nextId + newRecords.length);
    saveRecords(currentTeacher.id, updatedRecords);
    saveNextId(currentTeacher.id, nextId + newRecords.length);
  }, [records, nextId, currentTeacher]);

  const deleteRecord = useCallback((id: number) => {
    if (!currentTeacher) return;

    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);

    // Save to storage
    saveRecords(currentTeacher.id, updatedRecords);
  }, [records, currentTeacher]);

  const updateRecord = useCallback((id: number, updates: Partial<BookRecord>) => {
    if (!currentTeacher) return;

    const updatedRecords = records.map(record =>
      record.id === id ? { ...record, ...updates } : record
    );
    setRecords(updatedRecords);

    // Save to storage
    saveRecords(currentTeacher.id, updatedRecords);
  }, [records, currentTeacher]);

  const clearAllRecords = useCallback(() => {
    if (!currentTeacher) return;

    setRecords([]);
    setNextId(1);

    // Save to storage
    saveRecords(currentTeacher.id, []);
    saveNextId(currentTeacher.id, 1);
  }, [currentTeacher]);

  const importRecords = useCallback((newRecords: Omit<BookRecord, 'teacherId'>[]) => {
    if (!currentTeacher) return;

    // Add teacher ID to imported records
    const recordsWithTeacher = newRecords.map(record => ({
      ...record,
      teacherId: currentTeacher.id,
    }));

    const updatedRecords = [...records, ...recordsWithTeacher];
    const maxId = Math.max(...updatedRecords.map(r => r.id), nextId - 1);
    setRecords(updatedRecords);
    setNextId(maxId + 1);

    // Save to storage
    saveRecords(currentTeacher.id, updatedRecords);
    saveNextId(currentTeacher.id, maxId + 1);
  }, [records, nextId, currentTeacher]);

  return {
    records,
    stats,
    addRecords,
    deleteRecord,
    updateRecord,
    clearAllRecords,
    importRecords,
  };
};