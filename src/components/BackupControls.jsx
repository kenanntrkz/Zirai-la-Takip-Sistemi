import React, { useRef } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const BackupControls = () => {
  const fileInputRef = useRef(null);
  const { products } = useInventoryStore();

  const handleBackup = () => {
    const state = useInventoryStore.getState();
    const backupData = {
      timestamp: new Date().toISOString(),
      data: state
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zirai-ilac-takip-yedek-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Yedekleme başarıyla tamamlandı');
  };

  const handleRestore = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        useInventoryStore.setState(backupData.data);
        toast.success('Yedek başarıyla geri yüklendi');
      } catch (error) {
        toast.error('Yedek dosyası geçersiz');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Zirai İlaç Stok Raporu", 14, 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 22);

    const tableData = products.map(product => {
      const totalWaterCoverage = (product.quantity / product.dosagePerHundredLt) * 100;
      const taralCount = totalWaterCoverage / 1600;

      return [
        product.name,
        product.category,
        `${product.quantity.toFixed(2)} ${product.unit}`,
        `${product.dosagePerHundredLt.toFixed(2)} ${product.unit}`,
        `${taralCount.toFixed(1)} Taral\n(${Math.floor(totalWaterCoverage)} Lt)`
      ];
    });

    doc.autoTable({
      startY: 30,
      head: [['Ürün Adı', 'Hastalık/Zararlı', 'Miktar', 'Dozaj (100Lt)', 'Stok Kapasitesi']],
      body: tableData,
      headStyles: { fillColor: [59, 130, 246] },
      styles: { font: 'helvetica', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 40 }
      }
    });

    doc.save(`zirai-ilac-stok-raporu-${new Date().toLocaleDateString('tr-TR')}.pdf`);
    toast.success('PDF raporu oluşturuldu');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex gap-4"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBackup}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center"
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
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
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
        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF İndir
      </motion.button>
    </motion.div>
  );
};