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

    // If completely empty, seed with fixedBooks for 10th
    if (loadedBooks.length === 0) {
      const seededBooks: InventoryBook[] = [];
      Object.entries(fixedBookOptionsByClass).forEach(([cls, fixedBooks]) => {
        fixedBooks.forEach(fb => {
          // Determine category roughly based on title
          let category: 'textbook' | 'workbook' | 'notebook' | 'other' = 'other';
          const titleLower = fb.title.toLowerCase();
          if (titleLower.includes('text')) category = 'textbook';
          else if (titleLower.includes('work')) category = 'workbook';
          else if (titleLower.includes('note') || titleLower.includes('diary')) category = 'notebook';

          seededBooks.push({
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            title: fb.title,
            price: fb.price,
            category,
            cls,
            supplier: fb.supplier,
          });
        });
      });

      if (seededBooks.length > 0) {
        loadedBooks = seededBooks;
        saveInventory(currentTeacher.id, seededBooks);
      }
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
