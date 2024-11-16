import React, { useRef } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { createBackup, restoreBackup } from '../utils/backup';
import { exportToPDF } from '../utils/pdf';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const BackupControls: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { products, setFullState } = useInventoryStore();

  const handleBackup = () => {
    const state = useInventoryStore.getState();
    const success = createBackup(state);
    
    if (success) {
      toast.success('Yedekleme başarıyla tamamlandı');
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const restoredData = await restoreBackup(file);
      
      // Geri yüklenen veriyi kontrol et
      console.log('Geri yüklenen veri store\'a aktarılıyor:', restoredData);
      
      setFullState(restoredData);
      toast.success('Yedek başarıyla geri yüklendi');
    } catch (error) {
      console.error('Geri yükleme hatası:', error);
      toast.error('Yedek geri yükleme başarısız: Geçersiz veya bozuk dosya');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportPDF = () => {
    exportToPDF(products);
    toast.success('PDF raporu oluşturuldu');
  };

  return (
    <div className="mb-6 flex gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBackup}
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Yedekle
      </motion.button>

      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleRestore}
          accept=".json"
          className="hidden"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Geri Yükle
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExportPDF}
        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF İndir
      </motion.button>
    </div>
  );
};