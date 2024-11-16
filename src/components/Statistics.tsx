import React from 'react';
import { useInventoryStore } from '../store/useInventoryStore';

export const Statistics: React.FC = () => {
  const { usageRecords } = useInventoryStore();

  if (!usageRecords || usageRecords.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">İstatistikler</h2>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Son İlaçlamalar</h3>
          <div className="space-y-2">
            {usageRecords.map((record) => (
              <div key={record.id} className="flex justify-between items-center">
                <span className="text-gray-600">
                  {new Date(record.date).toLocaleDateString('tr-TR')}
                </span>
                <span className="font-medium">{record.totalWaterAmount} Lt</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};