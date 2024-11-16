import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLicenseStore } from '../store/useLicenseStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const LicenseActivation: React.FC = () => {
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    company: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { activateLicense, isActivated, offlineDays, getRemainingDays } = useLicenseStore();

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!licenseKey.trim()) {
      toast.error('Lütfen lisans anahtarını girin');
      return;
    }

    if (!customerInfo.email || !customerInfo.name) {
      toast.error('Lütfen gerekli bilgileri doldurun');
      return;
    }

    setIsLoading(true);
    try {
      const success = await activateLicense(licenseKey, customerInfo);
      if (success) {
        toast.success('Lisans başarıyla aktifleştirildi');
        navigate('/');
      }
    } catch (error) {
      toast.error('Lisans aktivasyonu sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isActivated) {
    const remainingDays = getRemainingDays();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              <span className="text-xl font-medium text-gray-900">Lisans Aktif</span>
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-gray-600">
                Kalan Süre: <span className="font-medium">{remainingDays} gün</span>
              </p>
              
              {offlineDays > 0 && (
                <p className="text-yellow-600">
                  Son {offlineDays} gündür çevrimdışı modda çalışıyor
                </p>
              )}
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
    >
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Lisans Aktivasyonu
        </h2>
        <form onSubmit={handleActivation} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lisans Anahtarı
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              pattern="[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firma Adı
            </label>
            <input
              type="text"
              value={customerInfo.company}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Aktivasyon yapılıyor...' : 'Lisansı Etkinleştir'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};