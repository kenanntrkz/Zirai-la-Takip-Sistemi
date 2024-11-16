import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export const createBackup = (data: any) => {
  try {
    // Veriyi JSON'a çevirmeden önce kontrol
    if (!data || !data.products) {
      throw new Error('Geçersiz veri formatı');
    }

    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      platform: 'web',
      data: {
        products: data.products,
        usageRecords: data.usageRecords
      }
    };

    // Veriyi kontrol et
    console.log('Yedeklenen veri:', backupData);

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });

    const fileName = `zirai-ilac-takip-yedek-${format(new Date(), 'dd-MM-yyyy-HH-mm', {
      locale: tr
    })}.json`;

    saveAs(blob, fileName);
    return true;
  } catch (error) {
    console.error('Yedekleme hatası:', error);
    toast.error('Yedekleme sırasında bir hata oluştu');
    return false;
  }
};

export const restoreBackup = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        
        // Veri formatını kontrol et
        if (!backupData.version || !backupData.timestamp || !backupData.data) {
          throw new Error('Geçersiz yedek dosyası formatı');
        }

        // Gerekli verilerin varlığını kontrol et
        if (!backupData.data.products || !Array.isArray(backupData.data.products)) {
          throw new Error('Ürün verileri bulunamadı veya geçersiz');
        }

        // Veriyi kontrol et
        console.log('Geri yüklenen veri:', backupData);

        // Başarılı durumda veriyi döndür
        resolve({
          products: backupData.data.products,
          usageRecords: backupData.data.usageRecords || []
        });
      } catch (error) {
        console.error('Geri yükleme hatası:', error);
        reject(new Error('Yedek dosyası okunamadı veya geçersiz format'));
      }
    };

    reader.onerror = () => {
      console.error('Dosya okuma hatası');
      reject(new Error('Dosya okuma hatası'));
    };

    reader.readAsText(file);
  });
};