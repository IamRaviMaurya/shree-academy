import React, { useRef, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { importFromExcel } from '../utils/excel';
import { BookRecord } from '../types';

interface ExcelPanelProps {
  onImportRecords: (records: Omit<BookRecord, 'teacherId'>[]) => void;
  onExportExcel: () => void;
  onExportTemplate: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ExcelPanel: React.FC<ExcelPanelProps> = ({
  onImportRecords,
  onExportExcel,
  onExportTemplate,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('');

    try {
      const records = await importFromExcel(file);
      onImportRecords(records);
      setUploadStatus(`<span style="color:#16a34a;font-weight:600;">✓ ${records.length} records successfully import ho gaye!</span>`);
      onShowToast(`${records.length} records import ho gaye!`, 'success');
    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus(`<span style="color:#dc2626;">✗ File parse karne mein error. Sahi format use karein.</span>`);
      onShowToast('File import karne mein error!', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Card title="Excel se Upload">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-150 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50"
          onClick={handleUploadClick}
        >
          <div className="text-4xl mb-3">📂</div>
          <div className="font-semibold text-base mb-2">
            Excel file click karke upload karein
          </div>
          <div className="text-sm text-gray-600">
            (.xlsx, .xls format)
          </div>
          <div className="text-xs text-gray-600 mt-4 leading-relaxed">
            Expected columns: <strong>Book Name, Book Price, Quantity, Student Name, Class, Issue Date, Return Date, Notes</strong>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {uploadStatus && (
          <div className="mt-3 text-sm" dangerouslySetInnerHTML={{ __html: uploadStatus }} />
        )}
        {isUploading && (
          <div className="mt-3 text-sm text-primary-600 font-medium">
            ⏳ File process ho rahi hai...
          </div>
        )}
      </Card>

      <Card title="Export Options">
        <div className="flex gap-3 flex-wrap">
          <Button variant="success" onClick={onExportExcel}>
            ⬇ Download as Excel
          </Button>
          <Button variant="primary" onClick={onExportTemplate}>
            📄 Download Template
          </Button>
        </div>
        <div className="mt-3 text-xs text-gray-600 leading-relaxed">
          <strong>Template:</strong> Sirf headers wali blank Excel download hogi — usmein data fill karke upload kar sakte hain.<br />
          <strong>Export:</strong> Saare current records Excel mein save ho jaayenge.
        </div>
      </Card>
    </>
  );
};