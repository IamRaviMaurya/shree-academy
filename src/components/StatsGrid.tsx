import React from 'react';
import { Stats } from '../types';
import { formatPrice } from '../utils/helpers';

interface StatsGridProps {
  stats: Stats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Records',
      value: stats.totalRecords.toString(),
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Total Books',
      value: stats.totalBooks.toString(),
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      label: 'Students',
      value: stats.totalStudents.toString(),
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      label: 'Total Value',
      value: formatPrice(stats.totalValue),
      color: 'text-info-600',
      bgColor: 'bg-info-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${item.bgColor}`}
        >
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            {item.label}
          </div>
          <div className={`text-2xl font-bold ${item.color}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};