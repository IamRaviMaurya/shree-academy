import * as XLSX from 'xlsx';
import { BookRecord } from '../types';
import { getTodayString } from './helpers';

export const exportToExcel = (records: BookRecord[], isTemplate = false): void => {
  const workbook = XLSX.utils.book_new();

  let data: (string | number)[][];

  if (isTemplate) {
    data = [['Book Name', 'Book Price (₹)', 'Quantity', 'Student Name', 'Contact Number', 'Class', 'Payment Status', 'Issue Date', 'Return Date', 'Notes']];
  } else {
    data = [
      ['#', 'Book Name', 'Book Price (₹)', 'Quantity', 'Total Amount (₹)', 'Student Name', 'Contact Number', 'Class', 'Payment Status', 'Issue Date', 'Return Date', 'Notes'],
      ...records.map((record, index) => [
        index + 1,
        record.book,
        record.price || 0,
        record.qty || 0,
        ((record.price || 0) * (record.qty || 0)),
        record.student,
        record.contactNumber || '',
        record.cls || '',
        record.paymentStatus || 'pending',
        record.date || '',
        record.ret || '',
        record.notes || '',
      ]),
    ];

    // Add summary row
    const totalQty = records.reduce((sum, record) => sum + (record.qty || 0), 0);
    const totalValue = records.reduce(
      (sum, record) => sum + ((record.price || 0) * (record.qty || 0)),
      0
    );
    data.push(['', 'TOTAL', '', totalQty, totalValue, '', '', '', '', '', '', '']);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet['!cols'] = [4, 22, 12, 8, 14, 18, 15, 10, 12, 12, 12, 20].map(width => ({ wch: width }));

  XLSX.utils.book_append_sheet(workbook, worksheet, isTemplate ? 'Template' : 'Records');

  const filename = isTemplate
    ? 'shree_academy_template.xlsx'
    : `shree_academy_records_${getTodayString()}.xlsx`;

  XLSX.writeFile(workbook, filename);
};

export const importFromExcel = (file: File): Promise<Omit<BookRecord, 'teacherId'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          reject(new Error('No data found in file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];

        const records: Omit<BookRecord, 'teacherId'>[] = [];
        let nextId = Date.now(); // Simple ID generation for imports

        rows.forEach((row) => {
          const book = String(row['Book Name'] || row['book name'] || row['BOOK NAME'] || '').trim();
          const student = String(row['Student Name'] || row['student name'] || row['STUDENT NAME'] || '').trim();

          if (!book || !student) return;

          records.push({
            id: nextId++,
            book,
            price: parseFloat(row['Book Price (₹)'] || row['Book Price'] || row['book price'] || row['price'] || 0) || 0,
            qty: parseInt(row['Quantity'] || row['quantity'] || row['QUANTITY'] || 1) || 1,
            student,
            cls: String(row['Class'] || row['class'] || '').trim(),
            date: String(row['Issue Date'] || row['issue date'] || '').trim(),
            ret: String(row['Return Date'] || row['return date'] || '').trim(),
            notes: String(row['Notes'] || row['notes'] || '').trim(),
            paymentStatus: (String(row['Payment Status'] || row['payment status'] || row['Payment'] || 'pending').trim().toLowerCase() as 'cash' | 'pending' | 'online') || 'pending',
          });
        });

        resolve(records);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};