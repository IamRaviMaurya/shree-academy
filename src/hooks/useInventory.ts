import { useState, useEffect, useCallback } from 'react';
import { InventoryBook } from '../types';
import { loadInventory, saveInventory } from '../utils/storage';
import { useAuth } from './useAuth';
import { fixedBookOptionsByClass } from '../utils/fixedBooks';

export const useInventory = () => {
  const { currentTeacher } = useAuth();
  const [books, setBooks] = useState<InventoryBook[]>([]);

  // Load data when teacher changes
  useEffect(() => {
    if (!currentTeacher) {
      setBooks([]);
      return;
    }

    let loadedBooks = loadInventory(currentTeacher.id);

    let changed = false;

    // Check against all fixedBookOptionsByClass and merge missing books
    Object.entries(fixedBookOptionsByClass).forEach(([cls, fixedBooks]) => {
      fixedBooks.forEach(fb => {
        // Check if book with this title and class already exists
        const exists = loadedBooks.some(b => b.cls === cls && b.title === fb.title);
        if (!exists) {
          let category: 'textbook' | 'workbook' | 'notebook' | 'other' = 'other';
          const titleLower = fb.title.toLowerCase();
          if (titleLower.includes('text') || titleLower.includes('bharati') || titleLower.includes('history') || titleLower.includes('science')) category = 'textbook';
          if (titleLower.includes('work')) category = 'workbook';
          if (titleLower.includes('note') || titleLower.includes('diary') || titleLower.includes('draw')) category = 'notebook';

          loadedBooks.push({
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            title: fb.title,
            price: fb.price,
            category,
            cls,
            supplier: fb.supplier || '',
          });
          changed = true;
        }
      });
    });

    if (changed) {
      saveInventory(currentTeacher.id, loadedBooks);
    }

    setBooks(loadedBooks);
  }, [currentTeacher]);

  const STANDARD_CLASSES = [
    'Jr. KG',
    'Sr. KG',
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
    '9th',
    '10th'
  ];

  const customClasses = Array.from(new Set(books.map(b => b.cls))).filter(c => !STANDARD_CLASSES.includes(c)).sort();
  const classes = [...STANDARD_CLASSES, ...customClasses];

  const getBooksByClass = useCallback((cls: string) => {
    return books.filter(b => b.cls === cls);
  }, [books]);

  const addBook = useCallback((book: Omit<InventoryBook, 'id'>) => {
    if (!currentTeacher) return;
    
    const newBook: InventoryBook = {
      ...book,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
    };
    
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    saveInventory(currentTeacher.id, updatedBooks);
  }, [books, currentTeacher]);

  const updateBook = useCallback((id: string, updates: Partial<InventoryBook>) => {
    if (!currentTeacher) return;

    const updatedBooks = books.map(book =>
      book.id === id ? { ...book, ...updates } : book
    );
    setBooks(updatedBooks);
    saveInventory(currentTeacher.id, updatedBooks);
  }, [books, currentTeacher]);

  const deleteBook = useCallback((id: string) => {
    if (!currentTeacher) return;

    const updatedBooks = books.filter(book => book.id !== id);
    setBooks(updatedBooks);
    saveInventory(currentTeacher.id, updatedBooks);
  }, [books, currentTeacher]);

  return {
    books,
    classes,
    getBooksByClass,
    addBook,
    updateBook,
    deleteBook,
  };
};
