import React, { useState } from 'react';
import { VineyardList } from './VineyardList';
import { VineyardForm } from './VineyardForm';
import { useVineyardStore } from '../store/useVineyardStore';
import { motion, AnimatePresence } from 'framer-motion';

export const VineyardSection: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { addVineyard, updateVineyard, getVineyard } = useVineyardStore();

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingId) {
      updateVineyard(editingId, data);
    } else {
      addVineyard(data);
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Bağlar</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Yeni Bağ Ekle
        </motion.button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? 'Bağ Düzenle' : 'Yeni Bağ Ekle'}
              </h2>
              <VineyardForm
                initialData={editingId ? getVineyard(editingId) : undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <VineyardList onEdit={handleEdit} />
    </div>
  );
};