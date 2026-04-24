import { BookRecord, Teacher } from '../types';
import { formatPrice, generateInvoiceNumber, calculateTotal } from './helpers';

export const generateWhatsAppMessage = (records: BookRecord[], teacher?: Teacher): string => {
  if (records.length === 0) return '';

  const firstRecord = records[0];
  const studentName = firstRecord.student;
  const studentClass = firstRecord.cls;
  const invoiceNumber = generateInvoiceNumber(firstRecord.id);

  // Calculate totals
  const totalAmount = records.reduce((sum, record) =>
    sum + calculateTotal(record.price || 0, record.qty || 0), 0
  );
  const totalBooks = records.reduce((sum, record) => sum + (record.qty || 0), 0);

  let message = `*=== Shree Academy ===*
*Book Issue Receipt — ${invoiceNumber}*
━━━━━━━━━━━━━━━━━
▶ Student : ${studentName}
${studentClass ? `▶ Class   : ${studentClass}\n` : ''}▶ Payment : ${firstRecord.paymentStatus === 'cash' ? '[Cash]' : firstRecord.paymentStatus === 'online' ? '[Online]' : '[Pending]'}
▶ Total Books : ${totalBooks}
━━━━━━━━━━━━━━━━━
*-- Books Issued --*`;

  records.forEach((record, index) => {
    const unitPrice = record.price || 0;
    const qty = record.qty || 0;
    const total = calculateTotal(unitPrice, qty);
    message += `\n${index + 1}. ${record.book}`;
    if (record.supplier) message += ` (${record.supplier})`;
    message += `\n   ${formatPrice(unitPrice)} × ${qty} = ${formatPrice(total)}`;
  });

  message += `\n━━━━━━━━━━━━━━━━━
*=> Grand Total: ${formatPrice(totalAmount)}*
━━━━━━━━━━━━━━━━━
▶ Issue Date : ${firstRecord.date || '—'}
${firstRecord.ret ? `▶ Return by  : ${firstRecord.ret}\n` : ''}`;

  // Collect all notes
  const allNotes = records
    .map(record => record.notes)
    .filter(note => note && note.trim())
    .join('; ');

  if (allNotes) {
    message += `▶ Notes : ${allNotes}\n`;
  }

  // Add UPI payment information if teacher has UPI ID and payment is pending
  if (teacher?.upiId && firstRecord.paymentStatus === 'pending') {
    message += `\n*-- UPI Payment Details --*
UPI ID: ${teacher.upiId}
Amount: ₹${totalAmount}
Payee: ${teacher.name}
━━━━━━━━━━━━━━━━━`;
  }

  message += `\n_Shree Academy — Authorized Receipt_`;

  try {
    const shareRecords = records.map(r => ({
      student: r.student,
      cls: r.cls,
      date: r.date,
      book: r.book,
      qty: r.qty,
      price: r.price,
      paymentStatus: r.paymentStatus,
      supplier: r.supplier,
      notes: r.notes
    }));
    const shareTeacher = teacher ? { name: teacher.name, upiId: teacher.upiId } : null;
    const shareData = btoa(encodeURIComponent(JSON.stringify({ records: shareRecords, teacher: shareTeacher })));
    const link = `${window.location.origin}/?share=${shareData}`;
    message += `\n\n🔗 *View & Download PDF:* \n${link}`;
  } catch (e) {
    console.error('Failed to generate share link', e);
  }

  return message;
};

export const shareOnWhatsApp = (records: BookRecord[], teacher?: Teacher): void => {
  const message = generateWhatsAppMessage(records, teacher);
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};