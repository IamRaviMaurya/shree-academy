import React, { useState, useMemo } from 'react';
import { BookRecord } from '../types';
import { filterRecords, formatPrice, calculateTotal } from '../utils/helpers';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Badge } from './Badge';

interface RecordsTableProps {
  records: BookRecord[];
  onDeleteRecord: (id: number) => void;
  onShowInvoice: (studentName: string) => void;
  onShareWhatsApp: (records: BookRecord[]) => void;
  onEditRecord: (record: BookRecord) => void;
  onExportExcel: () => void;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  onDeleteRecord,
  onShowInvoice,
  onShareWhatsApp,
  onEditRecord,
  onExportExcel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const groupedRecords = useMemo(() => {
    const filtered = filterRecords(records, searchQuery);
    const grouped: { [key: string]: BookRecord[] } = {};

    filtered.forEach(record => {
      const key = `${record.student.toLowerCase()}|${record.cls.toLowerCase()}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record);
    });

    return Object.keys(grouped).map(key => grouped[key]).sort((a: BookRecord[], b: BookRecord[]) =>
      a[0].student.localeCompare(b[0].student)
    );
  }, [records, searchQuery]);

  const totalBooks = useMemo(() => {
    return groupedRecords.reduce((sum: number, group: BookRecord[]) =>
      sum + group.reduce((groupSum: number, record: BookRecord) => groupSum + (record.qty || 0), 0), 0
    );
  }, [groupedRecords]);

  const totalValue = useMemo(() => {
    return groupedRecords.reduce((sum: number, group: BookRecord[]) =>
      sum + group.reduce((groupSum: number, record: BookRecord) =>
        groupSum + calculateTotal(record.price || 0, record.qty || 0), 0
      ), 0
    );
  }, [groupedRecords]);

  const handleDelete = (id: number) => {
    if (window.confirm('Yeh record delete karna chahte hain?')) {
      onDeleteRecord(id);
    }
  };

  if (!records.length) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📚</div>
          <div className="text-gray-600">
            Abhi koi record nahi. Pehle record add karein.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {groupedRecords.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-gray-600">
                Koi matching record nahi mila.
              </div>
            </div>
          </Card>
        ) : (
          groupedRecords.map((group: BookRecord[], groupIndex: number) => {
            const firstRecord = group[0];
            const groupTotal = group.reduce((sum: number, record: BookRecord) =>
              sum + calculateTotal(record.price || 0, record.qty || 0), 0
            );

            return (
              <Card key={`${firstRecord.student}-${firstRecord.cls}`} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-lg text-gray-900">{firstRecord.student}</div>
                    <div className="text-sm text-gray-600">{firstRecord.cls || 'No Class'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{group.length} book{group.length > 1 ? 's' : ''}</div>
                    <div className="text-lg font-bold text-primary-600">{formatPrice(groupTotal)}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {group.map((record: BookRecord, bookIndex: number) => {
                    const unitPrice = record.price || 0;
                    const qty = record.qty || 0;
                    const total = calculateTotal(unitPrice, qty);

                    return (
                      <div key={record.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{record.book}</div>
                            {record.supplier && (
                              <div className="text-xs text-gray-600">Supplier: {record.supplier}</div>
                            )}
                            {record.notes && (
                              <div className="text-xs text-gray-700 mt-1">📝 {record.notes}</div>
                            )}
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-sm font-semibold text-primary-600">{formatPrice(total)}</div>
                            <div className="text-xs text-gray-600">{formatPrice(unitPrice)} × {qty}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-600 mt-2">
                          <div>
                            <Badge
                              variant={
                                record.paymentStatus === 'cash' ? 'green' :
                                record.paymentStatus === 'online' ? 'blue' :
                                'amber'
                              }
                              className="text-xs mr-2"
                            >
                              {record.paymentStatus === 'cash' ? '💰 Cash' :
                               record.paymentStatus === 'online' ? '💳 Online' :
                               '⏳ Pending'}
                            </Badge>
                          </div>
                          <div className="text-right">
                            {record.date && <div>📅 {record.date}</div>}
                            {record.ret && <div>🔄 {record.ret}</div>}
                          </div>
                        </div>

                        <div className="flex gap-1 mt-3">
                          <IconButton
                            variant="primary"
                            onClick={() => onShowInvoice(firstRecord.student)}
                            title="Invoice dekho"
                          >
                            🧾
                          </IconButton>
                          <IconButton
                            variant="success"
                            onClick={() => onShareWhatsApp(group)}
                            title="WhatsApp share"
                          >
                            💬
                          </IconButton>
                          <IconButton
                            variant="default"
                            onClick={() => onEditRecord(record)}
                            title="Edit record"
                          >
                            ✏️
                          </IconButton>
                          <IconButton
                            variant="danger"
                            onClick={() => handleDelete(record.id)}
                            title="Delete"
                          >
                            🗑
                          </IconButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="flex gap-3 mb-4 flex-wrap items-center">
          <Input
            placeholder="🔍 Student ya book name se search karein..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-64"
          />
          <Button variant="success" onClick={onExportExcel}>
            ⬇ Export Excel
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">#</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Book Name</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Price/Book</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Qty</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Total</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Student</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Class</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Payment</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Issue Date</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Return Date</th>
                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8">
                    <div className="text-gray-600">
                      <div className="text-3xl mb-2">📚</div>
                      Koi matching record nahi mila.
                    </div>
                  </td>
                </tr>
              ) : (
                groupedRecords.map((group: BookRecord[], groupIndex: number) => {
                  const firstRecord = group[0];

                  return (
                    <tr key={`${firstRecord.student}-${firstRecord.cls}`} className="border-b border-gray-200 hover:bg-primary-50">
                      <td className="p-3 text-gray-600 text-sm">{groupIndex + 1}</td>
                      <td className="p-3">
                        <div className="space-y-2">
                          {group.map((record, bookIndex) => (
                            <div key={record.id} className="flex items-start gap-2">
                              <span className="text-xs text-gray-500 mt-0.5">•</span>
                              <div>
                                <div className="font-semibold text-sm">{record.book}</div>
                                {record.supplier && (
                                  <div className="text-xs text-gray-500">Supplier: {record.supplier}</div>
                                )}
                                {record.notes && (
                                  <div className="text-xs text-gray-600">📝 {record.notes}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {group.map((record: BookRecord) => (
                            <div key={record.id} className="font-semibold text-success-600 text-sm">
                              {formatPrice(record.price || 0)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {group.map((record: BookRecord) => (
                            <div key={record.id}>
                              <Badge variant="blue" className="text-xs">{record.qty || 1}</Badge>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-info-600 text-sm">
                        <div className="space-y-1">
                          {group.map((record: BookRecord) => (
                            <div key={record.id}>
                              {formatPrice(calculateTotal(record.price || 0, record.qty || 0))}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-medium">
                        <div className="text-sm">{firstRecord.student}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {group.length} book{group.length > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="p-3">
                        {firstRecord.cls ? (
                          <Badge variant="amber">{firstRecord.cls}</Badge>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {group.map((record: BookRecord) => (
                            <div key={record.id}>
                              <Badge
                                variant={
                                  record.paymentStatus === 'cash' ? 'green' :
                                  record.paymentStatus === 'online' ? 'blue' :
                                  'amber'
                                }
                                className="text-xs"
                              >
                                {record.paymentStatus === 'cash' ? '💰 Cash' :
                                 record.paymentStatus === 'online' ? '💳 Online' :
                                 '⏳ Pending'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="space-y-1">
                          {group.map((record: BookRecord) => (
                            <div key={record.id}>{record.date || '—'}</div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {group.map((record: BookRecord) => (
                            <div key={record.id}>
                              {record.ret ? (
                                <Badge variant="green" className="text-xs">{record.ret}</Badge>
                              ) : (
                                '—'
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          {group.map((record: BookRecord) => (
                            <div key={record.id} className="flex gap-1">
                              <IconButton
                                variant="primary"
                                onClick={() => onShowInvoice(firstRecord.student)}
                                title="Invoice dekho"
                              >
                                🧾
                              </IconButton>
                              <IconButton
                                variant="success"
                                onClick={() => onShareWhatsApp(group)}
                                title="WhatsApp share"
                              >
                                💬
                              </IconButton>
                              <IconButton
                                variant="default"
                                onClick={() => onEditRecord(record)}
                                title="Edit record"
                              >
                                ✏️
                              </IconButton>
                              <IconButton
                                variant="danger"
                                onClick={() => handleDelete(record.id)}
                                title="Delete"
                              >
                                🗑
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        </Card>

        {groupedRecords.length > 0 && (
          <Card className="p-4">
            <div className="flex gap-6 flex-wrap text-sm">
              <span className="text-gray-600">
                Students: <strong className="text-primary-600">{groupedRecords.length}</strong>
              </span>
              <span className="text-gray-600">
                Total Books: <strong className="text-success-600">{totalBooks}</strong>
              </span>
              <span className="text-gray-600">
                Total Value: <strong className="text-info-600">{formatPrice(totalValue)}</strong>
              </span>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};