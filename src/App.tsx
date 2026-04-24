import React, { useState, useRef } from 'react';
import { TabType, BookRecord } from './types';
import { useRecords } from './hooks/useRecords';
import { useToast } from './hooks/useToast';
import { useAuth } from './hooks/useAuth';
import { exportToExcel } from './utils/excel';
import { shareOnWhatsApp } from './utils/whatsapp';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { StatsGrid } from './components/StatsGrid';
import { AddRecordForm } from './components/AddRecordForm';
import { RecordsTable } from './components/RecordsTable';
import { ExcelPanel } from './components/ExcelPanel';
import { InvoiceModal } from './components/InvoiceModal';
import { EditRecordModal } from './components/EditRecordModal';
import { ToastContainer } from './components/Toast';
import { Login } from './components/Login';

const App: React.FC = () => {
  const { isAuthenticated, currentTeacher, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('add');
  const [selectedRecords, setSelectedRecords] = useState<BookRecord[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BookRecord | null>(null);
  const formRef = useRef<{ resetForm: (keepStudent: boolean) => void } | null>(null);

  const { records, stats, addRecords, deleteRecord, updateRecord, clearAllRecords, importRecords } = useRecords();
  const { toasts, addToast, removeToast } = useToast();

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleAddRecord = (recordDataList: Omit<BookRecord, 'id' | 'teacherId'>[], keepStudentInfo: boolean) => {
    try {
      addRecords(recordDataList);
      addToast('Record successfully add ho gaya! ✓', 'success');
      if (formRef.current) {
        formRef.current.resetForm(keepStudentInfo);
      }
    } catch (error) {
      addToast((error as Error).message, 'error');
      return;
    }
  };

  const handleDeleteRecord = (id: number) => {
    deleteRecord(id);
    addToast('Record delete ho gaya.', 'error');
  };

  const handleClearAll = () => {
    clearAllRecords();
    addToast('Poora data clear ho gaya.', 'error');
  };

  const handleShowInvoice = (studentName: string) => {
    // Find all records for this student
    const studentRecords = records.filter(record => record.student === studentName);
    if (studentRecords.length > 0) {
      setSelectedRecords(studentRecords); // New state for all records
      setIsInvoiceModalOpen(true);
    }
  };

  const handleCloseInvoice = () => {
    setIsInvoiceModalOpen(false);
    setSelectedRecords([]);
  };

  const handleShareWhatsApp = (records: BookRecord[]) => {
    if (records.length > 0) {
      shareOnWhatsApp(records, currentTeacher || undefined);
    }
  };

  const handleEditRecord = (record: BookRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (id: number, updates: Partial<BookRecord>) => {
    updateRecord(id, updates);
    addToast('Record updated successfully! ✓', 'success');
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  const handleExportExcel = () => {
    exportToExcel(records, false);
    addToast('Excel export ho gayi!');
  };

  const handleExportTemplate = () => {
    exportToExcel([], true);
    addToast('Template download ho gayi!');
  };

  const handleImportRecords = (newRecords: Omit<BookRecord, 'teacherId'>[]) => {
    importRecords(newRecords);
  };

  const handleLogout = () => {
    logout();
    addToast('Logout successful!', 'success');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onClearAll={handleClearAll}
        onLogout={handleLogout}
        teacherName={currentTeacher?.name}
      />

      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="max-w-7xl mx-auto p-2 sm:p-4 pb-8">
        {activeTab === 'add' && (
          <>
            <StatsGrid stats={stats} />
            <AddRecordForm
              ref={formRef}
              onAddRecord={handleAddRecord}
              onShowToast={addToast}
            />
          </>
        )}

        {activeTab === 'records' && (
          <RecordsTable
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onShowInvoice={handleShowInvoice}
            onShareWhatsApp={handleShareWhatsApp}
            onEditRecord={handleEditRecord}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 'excel' && (
          <ExcelPanel
            onImportRecords={handleImportRecords}
            onExportExcel={handleExportExcel}
            onExportTemplate={handleExportTemplate}
            onShowToast={addToast}
          />
        )}
      </main>

      <InvoiceModal
        records={selectedRecords}
        teacher={currentTeacher}
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoice}
        onPrint={() => {}}
        onShareWhatsApp={handleShareWhatsApp}
      />

      <EditRecordModal
        record={editingRecord}
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;