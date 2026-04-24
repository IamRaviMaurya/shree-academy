import React, { useRef } from 'react';
import { BookRecord, Teacher } from '../types';
import { formatPrice, generateInvoiceNumber, calculateTotal } from '../utils/helpers';
import { generateUPIPaymentUrl } from '../utils/upi';
import { Modal } from './Modal';
import { Button } from './Button';
import { QRCodeComponent } from './QRCode';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode';

interface InvoiceModalProps {
  records: BookRecord[];
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onShareWhatsApp: (records: BookRecord[]) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  records,
  teacher,
  isOpen,
  onClose,
  onPrint,
  onShareWhatsApp,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!records || records.length === 0) return null;

  const firstRecord = records[0];
  const studentName = firstRecord.student;
  const studentClass = firstRecord.cls;

  // Calculate totals for all books
  const totalAmount = records.reduce((sum, record) =>
    sum + calculateTotal(record.price || 0, record.qty || 0), 0
  );

  const totalBooks = records.reduce((sum, record) => sum + (record.qty || 0), 0);

  // Generate invoice number from the first record
  const invoiceNumber = generateInvoiceNumber(firstRecord.id);

  // Collect all notes
  const allNotes = records
    .map(record => record.notes)
    .filter(note => note && note.trim())
    .join('; ');

  // Generate UPI payment URL if teacher has UPI ID
  const upiUrl = teacher?.upiId
    ? generateUPIPaymentUrl(
      teacher.upiId,
      totalAmount,
      teacher.name,
      `Book Issue - ${studentName} - Invoice ${invoiceNumber}`
    )
    : null;

  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write('<html><body>Generating invoice for printing...</body></html>');

    // Generate table rows for all books
    const bookRows = records.map(record => {
      const unitPrice = record.price || 0;
      const qty = record.qty || 0;
      const total = calculateTotal(unitPrice, qty);
      return `
        <tr>
          <td>${record.book}${record.supplier ? `<br><small style="color: #666;">Supplier: ${record.supplier}</small>` : ''}</td>
          <td style="text-align: right">${formatPrice(unitPrice)}</td>
          <td style="text-align: center">${qty}</td>
          <td style="text-align: right; font-weight: 600;">${formatPrice(total)}</td>
        </tr>
      `;
    }).join('');

    // Collect all notes
    const allNotes = records
      .map(record => record.notes)
      .filter(note => note && note.trim())
      .join('; ');

    // Generate QR code HTML if UPI URL exists
    let qrCodeHtml = '';
    if (upiUrl && teacher?.upiId) {
      try {
        const qrDataUrl = await QRCode.toDataURL(upiUrl, {
          width: 120,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        qrCodeHtml = `
          <div style="margin-top: 24px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; page-break-inside: avoid;">
            <div style="margin-bottom: 16px; overflow: hidden; border-bottom: 1px solid #dcfce7; padding-bottom: 12px;">
              <div style="font-size: 15px; font-weight: 700; color: #166534; float: left;">
                <span style="display: inline-block; margin-right: 6px;">💳</span> Pay via UPI
              </div>
              <div style="font-size: 13px; color: #15803d; float: right; margin-top: 2px; font-weight: 500;">
                Teacher: ${teacher.name}
              </div>
            </div>
            <table style="width: 100%; border: none; margin: 0; padding: 0;">
              <tr>
                <td style="width: 140px; text-align: center; vertical-align: middle; border: none; padding: 0;">
                  <img src="${qrDataUrl}" width="110" height="110" style="display: block; background: #ffffff; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px; margin: 0 auto;" />
                  <div style="font-size: 12px; font-weight: 600; color: #4b5563; margin-top: 10px;">
                    Scan to pay ₹${totalAmount}
                  </div>
                </td>
                <td style="vertical-align: middle; border: none; padding: 0 0 0 24px;">
                  <div style="font-size: 13px; color: #374151; line-height: 1.8;">
                    <div><strong style="color: #111827; display: inline-block; width: 65px;">UPI ID:</strong> ${teacher.upiId}</div>
                    <div><strong style="color: #111827; display: inline-block; width: 65px;">Amount:</strong> ₹${totalAmount}</div>
                    <div><strong style="color: #111827; display: inline-block; width: 65px;">Payee:</strong> ${teacher.name}</div>
                    <div style="margin-top: 12px; color: #15803d; font-weight: 600; background: #dcfce7; display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px;">
                      Scan QR code with any UPI app
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        `;
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice — Shree Academy</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', sans-serif; padding: 32px; max-width: 640px; margin: auto; color: #111; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { padding: 9px 10px; font-size: 13px; border-bottom: 1px solid #ddd; }
            th { background: #E6F1FB; color: #0C447C; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
            .inv-total-row td { background: #E6F1FB; color: #0C447C; font-weight: 700; border-bottom: none; }
            .inv-logo { font-size: 22px; font-weight: 800; color: #185FA5; }
            .inv-header { display: flex; justify-content: space-between; margin-bottom: 18px; }
            .inv-meta { font-size: 12px; line-height: 1.8; text-align: right; }
            .inv-footer { margin-top: 20px; display: flex; justify-content: space-between; }
            .inv-sign { font-size: 12px; color: #888; }
            .inv-sign span { display: block; margin-top: 28px; border-top: 1px solid #ccc; padding-top: 4px; }
            hr { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
            @media print { body { padding: 16px; } @page { margin: 1cm; } }
          </style>
        </head>
        <body>
          <div style="border: 1px solid #ddd; padding: 24px; background: #fff;">
            <div class="inv-header">
              <div>
                <div class="inv-logo">Shree Academy</div>
                <div style="font-size: 11px; color: #666; margin-top: 3px;">Book Issue Receipt / Invoice</div>
              </div>
              <div class="inv-meta">
                <strong>Invoice #:</strong> ${invoiceNumber}<br>
                <strong>Issue Date:</strong> ${firstRecord.date || new Date().toISOString().split('T')[0]}<br>
                <strong>Total Books:</strong> ${totalBooks}<br>
                ${firstRecord.ret ? `<strong>Return by:</strong> ${firstRecord.ret}<br>` : ''}
              </div>
            </div>
            <hr />

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 14px;">
              <div><span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Student</span><br><strong>${studentName}</strong></div>
              <div><span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Class</span><br><strong>${studentClass || '—'}</strong></div>
              <div><span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Payment Status</span><br><strong style="color: ${firstRecord.paymentStatus === 'cash' ? '#16a34a' : firstRecord.paymentStatus === 'online' ? '#2563eb' : '#ca8a04'};">${firstRecord.paymentStatus === 'cash' ? '💰 Cash' : firstRecord.paymentStatus === 'online' ? '💳 Online' : '⏳ Pending'}</strong></div>
              <div><span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Issue Date</span><br><strong>${firstRecord.date || '—'}</strong></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 40%; text-align: left;">Book Name</th>
                  <th style="text-align: right">Price/Book</th>
                  <th style="text-align: center">Qty</th>
                  <th style="text-align: right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${bookRows}
                <tr class="inv-total-row">
                  <td colspan="3" style="text-align: right; font-weight: 700;">Grand Total</td>
                  <td style="text-align: right; font-size: 15px;">${formatPrice(totalAmount)}</td>
                </tr>
              </tbody>
            </table>

            ${allNotes ? '<div style="font-size: 12px; color: #666; margin-top: 8px; padding: 8px 10px; background: #f5f5f0; border-radius: 6px;">📝 Notes: ' + allNotes + '</div>' : ''}

            ${qrCodeHtml}

            <div class="inv-footer">
              <div class="inv-sign">
                Authorized by
                <span>Shree Academy</span>
              </div>
              <div style="font-size: 12px; color: #666; text-align: right;">
                Thank you!<br>
                <span style="font-size: 11px;">Please keep this receipt safe.</span>
              </div>
            </div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const handleSharePDF = async () => {
    // Generate table rows for all books
    const bookRows = records.map(record => {
      const unitPrice = record.price || 0;
      const qty = record.qty || 0;
      const total = calculateTotal(unitPrice, qty);
      return `
        <tr>
          <td>${record.book}${record.supplier ? `<br><small style="color: #666;">Supplier: ${record.supplier}</small>` : ''}</td>
          <td style="text-align: right">${formatPrice(unitPrice)}</td>
          <td style="text-align: center">${qty}</td>
          <td style="text-align: right; font-weight: 600;">${formatPrice(total)}</td>
        </tr>
      `;
    }).join('');

    // Collect all notes
    const allNotes = records
      .map(record => record.notes)
      .filter(note => note && note.trim())
      .join('; ');

    // Generate QR code HTML if UPI URL exists
    let qrCodeHtml = '';
    if (upiUrl && teacher?.upiId) {
      try {
        const qrDataUrl = await QRCode.toDataURL(upiUrl, {
          width: 120,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        qrCodeHtml = `
          <div style="margin-top: 24px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; page-break-inside: avoid;">
            <div style="margin-bottom: 16px; overflow: hidden; border-bottom: 1px solid #dcfce7; padding-bottom: 12px;">
              <div style="font-size: 15px; font-weight: 700; color: #166534; float: left;">
                <span style="display: inline-block; margin-right: 6px;">💳</span> Pay via UPI
              </div>
              <div style="font-size: 13px; color: #15803d; float: right; margin-top: 2px; font-weight: 500;">
                Teacher: ${teacher.name}
              </div>
            </div>
            <table style="width: 100%; border: none; margin: 0; padding: 0;">
              <tr>
                <td style="width: 140px; text-align: center; vertical-align: middle; border: none; padding: 0;">
                  <img src="${qrDataUrl}" width="110" height="110" style="display: block; background: #ffffff; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px; margin: 0 auto;" />
                  <div style="font-size: 12px; font-weight: 600; color: #4b5563; margin-top: 10px;">
                    Scan to pay ₹${totalAmount}
                  </div>
                </td>
                <td style="vertical-align: middle; border: none; padding: 0 0 0 24px;">
                  <div style="font-size: 13px; color: #374151; line-height: 1.8;">
                    <div><strong style="color: #111827; display: inline-block; width: 65px;">UPI ID:</strong> ${teacher.upiId}</div>
                    <div><strong style="color: #111827; display: inline-block; width: 65px;">Amount:</strong> ₹${totalAmount}</div>
                    <div><strong style="color: #111827; display: inline-block; width: 65px;">Payee:</strong> ${teacher.name}</div>
                    <div style="margin-top: 12px; color: #15803d; font-weight: 600; background: #dcfce7; display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px;">
                      Scan QR code with any UPI app
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        `;
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }

    const invoiceHtml = `
      <div style="font-family: 'Segoe UI', sans-serif; padding: 32px; max-width: 640px; margin: auto; color: #111; background: #fff;">
        <style>
          .pdf-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .pdf-table th, .pdf-table td { padding: 9px 10px; font-size: 13px; border-bottom: 1px solid #ddd; }
          .pdf-table th { background: #E6F1FB; color: #0C447C; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
          .pdf-table th.text-left { text-align: left; }
          .inv-total-row td { background: #E6F1FB; color: #0C447C; font-weight: 700; border-bottom: none; }
          .inv-logo { font-size: 22px; font-weight: 800; color: #185FA5; }
          .inv-header { display: flex; justify-content: space-between; margin-bottom: 18px; }
          .inv-meta { font-size: 12px; line-height: 1.8; text-align: right; }
          .inv-footer { margin-top: 20px; display: flex; justify-content: space-between; }
          .inv-sign { font-size: 12px; color: #888; }
          .inv-sign span { display: block; margin-top: 28px; border-top: 1px solid #ccc; padding-top: 4px; }
          .pdf-hr { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
        </style>
        <div style="border: 1px solid #ddd; padding: 24px; background: #fff;">
          <div class="inv-header">
            <div>
              <div class="inv-logo">Shree Academy</div>
              <div style="font-size: 11px; color: #666; margin-top: 3px;">Book Issue Receipt / Invoice</div>
            </div>
            <div class="inv-meta">
              <strong>Invoice #:</strong> ${invoiceNumber}<br>
              <strong>Issue Date:</strong> ${firstRecord.date || new Date().toISOString().split('T')[0]}<br>
              <strong>Total Books:</strong> ${totalBooks}<br>
              ${firstRecord.ret ? `<strong>Return by:</strong> ${firstRecord.ret}<br>` : ''}
            </div>
          </div>
          <hr class="pdf-hr" />

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 14px;">
            <div><span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Student</span><br><strong>${studentName}</strong></div>
            <div><span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Class</span><br><strong>${studentClass || '—'}</strong></div>
            <div><span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Payment Status</span><br><strong style="color: ${firstRecord.paymentStatus === 'cash' ? '#16a34a' : firstRecord.paymentStatus === 'online' ? '#2563eb' : '#ca8a04'};">${firstRecord.paymentStatus === 'cash' ? '💰 Cash' : firstRecord.paymentStatus === 'online' ? '💳 Online' : '⏳ Pending'}</strong></div>
            <div><span style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;">Issue Date</span><br><strong>${firstRecord.date || '—'}</strong></div>
          </div>

          <table class="pdf-table">
            <thead>
              <tr>
                <th class="text-left" style="width: 40%">Book Name</th>
                <th style="text-align: right">Price/Book</th>
                <th style="text-align: center">Qty</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${bookRows}
              <tr class="inv-total-row">
                <td colspan="3" style="text-align: right; font-weight: 700;">Grand Total</td>
                <td style="text-align: right; font-size: 15px;">${formatPrice(totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          ${allNotes ? '<div style="font-size: 12px; color: #666; margin-top: 8px; padding: 8px 10px; background: #f5f5f0; border-radius: 6px;">📝 Notes: ' + allNotes + '</div>' : ''}

          ${qrCodeHtml}

          <div class="inv-footer">
            <div class="inv-sign">
              Authorized by
              <span>Shree Academy</span>
            </div>
            <div style="font-size: 12px; color: #666; text-align: right;">
              Thank you!<br>
              <span style="font-size: 11px;">Please keep this receipt safe.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const options = {
      margin: 0.5,
      filename: `Invoice-${invoiceNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      await html2pdf().set(options).from(invoiceHtml).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Preview"
      actions={
        <>
          <Button variant="whatsapp" onClick={() => onShareWhatsApp(records)}>
            💬 WhatsApp
          </Button>
          <Button onClick={handleSharePDF}>
            📄 PDF
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            🖨 Print
          </Button>
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <div ref={invoiceRef} className="border border-gray-300 rounded-lg p-6 bg-white font-sans">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xl font-bold text-primary-600">Shree Academy</div>
            <div className="text-xs text-gray-600 mt-1">Book Issue Receipt / Invoice</div>
          </div>
          <div className="text-xs text-gray-600 text-right leading-relaxed">
            <strong>Invoice #:</strong> {invoiceNumber}<br />
            <strong>Issue Date:</strong> {firstRecord.date || new Date().toISOString().split('T')[0]}<br />
            <strong>Total Books:</strong> {totalBooks}<br />
            {firstRecord.ret && (
              <>
                <strong>Return by:</strong> {firstRecord.ret}<br />
              </>
            )}
          </div>
        </div>
        <hr className="border-gray-300 mb-4" />

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Student</span><br />
            <strong>{studentName}</strong>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Class</span><br />
            <strong>{studentClass || '—'}</strong>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Payment Status</span><br />
            <strong className={
              firstRecord.paymentStatus === 'cash' ? 'text-green-600' :
                firstRecord.paymentStatus === 'online' ? 'text-blue-600' : 'text-yellow-600'
            }>
              {firstRecord.paymentStatus === 'cash' ? '💰 Cash' :
                firstRecord.paymentStatus === 'online' ? '💳 Online' : '⏳ Pending'}
            </strong>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Issue Date</span><br />
            <strong>{firstRecord.date || '—'}</strong>
          </div>
        </div>

        <table className="w-full border-collapse text-sm mb-4">
          <thead>
            <tr className="bg-primary-50 text-primary-800">
              <th className="text-left p-2 text-xs font-semibold uppercase tracking-wide" style={{ width: '40%' }}>Book Name</th>
              <th className="text-right p-2 text-xs font-semibold uppercase tracking-wide">Price/Book</th>
              <th className="text-center p-2 text-xs font-semibold uppercase tracking-wide">Qty</th>
              <th className="text-right p-2 text-xs font-semibold uppercase tracking-wide">Total</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const unitPrice = record.price || 0;
              const qty = record.qty || 0;
              const total = calculateTotal(unitPrice, qty);
              return (
                <tr key={index}>
                  <td className="p-2">
                    {record.book}
                    {record.supplier && (
                      <>
                        <br />
                        <small className="text-gray-500">Supplier: {record.supplier}</small>
                      </>
                    )}
                  </td>
                  <td className="text-right p-2">{formatPrice(unitPrice)}</td>
                  <td className="text-center p-2">{qty}</td>
                  <td className="text-right p-2 font-semibold">{formatPrice(total)}</td>
                </tr>
              );
            })}
            <tr className="bg-primary-50 text-primary-800 font-bold">
              <td colSpan={3} className="text-right p-2">Grand Total</td>
              <td className="text-right p-2 text-base">{formatPrice(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        {allNotes && (
          <div className="text-xs text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">
            📝 Notes: {allNotes}
          </div>
        )}

        {/* UPI Payment QR Code */}
        {upiUrl && teacher?.upiId && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-green-800">
                💳 Pay via UPI
              </div>
              <div className="text-xs text-green-600">
                Teacher: {teacher.name}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="text-center shrink-0">
                <div className="inline-block bg-white p-1.5 border border-gray-200 rounded-lg shadow-sm">
                  <QRCodeComponent
                    value={upiUrl}
                    size={110}
                    className="block"
                  />
                </div>
                <div className="text-xs font-semibold text-gray-600 mt-2">
                  Scan to pay ₹{totalAmount}
                </div>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed text-center sm:text-left">
                <div className="flex sm:block justify-center gap-2">
                  <strong className="text-gray-900 inline-block w-16 text-right sm:text-left">UPI ID:</strong>
                  <span>{teacher.upiId}</span>
                </div>
                <div className="flex sm:block justify-center gap-2">
                  <strong className="text-gray-900 inline-block w-16 text-right sm:text-left">Amount:</strong>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex sm:block justify-center gap-2">
                  <strong className="text-gray-900 inline-block w-16 text-right sm:text-left">Payee:</strong>
                  <span>{teacher.name}</span>
                </div>
                <div className="mt-3 text-green-700 font-semibold bg-green-100 inline-block px-3 py-1 rounded text-xs">
                  Scan QR code with any UPI app
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mt-5">
          <div className="text-xs text-gray-600">
            Authorized by
            <span className="block mt-7 border-t border-gray-300 pt-1">Shree Academy</span>
          </div>
          <div className="text-xs text-gray-600 text-right">
            Thank you!<br />
            <span className="text-xs">Please keep this receipt safe.</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};