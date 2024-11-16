import React from 'react';
import { useVineyardStore } from '../store/useVineyardStore';
import { motion } from 'framer-motion';

interface VineyardListProps {
  onEdit: (id: string) => void;
}

export const VineyardList: React.FC<VineyardListProps> = ({ onEdit }) => {
  const { vineyards, deleteVineyard } = useVineyardStore();

  if (vineyards.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Henüz bağ kaydı eklenmemiş
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vineyards.map(vineyard => (
        <motion.div
          key={vineyard.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">{vineyard.name}</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Ada/Parsel: {vineyard.parcelInfo.ada}/{vineyard.parcelInfo.parcel}</p>
            <p>Alan: {(vineyard.area / 1000).toFixed(1)} dönüm</p>
            <p>Üzüm Çeşidi: {vineyard.grapeType}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onEdit(vineyard.id)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Düzenle
            </button>
            <button
              onClick={() => deleteVineyard(vineyard.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Sil
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};