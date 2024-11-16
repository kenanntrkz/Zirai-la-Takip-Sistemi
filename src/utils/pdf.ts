import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Product } from '../types/inventory';

export const exportToPDF = (products: Product[]) => {
  const doc = new jsPDF();
  
  // Başlık
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Zirai İlaç Stok Raporu", 14, 15);
  
  // Tarih
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Oluşturma Tarihi: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: tr })}`,
    14, 
    22
  );

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

  doc.save(`zirai-ilac-stok-raporu-${format(new Date(), 'dd-MM-yyyy', { locale: tr })}.pdf`);
};