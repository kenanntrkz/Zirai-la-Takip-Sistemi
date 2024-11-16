import React, { useState } from 'react';
import { Product } from '../types/inventory';
import { useVineyardStore } from '../store/useVineyardStore';
import toast from 'react-hot-toast';

interface UsageFormProps {
  products: Product[];
  onSubmit: (data: {
    date: Date;
    vineyardId: string;
    vineyardName: string;
    totalWaterAmount: number;
    selectedProducts: { id: string; calculatedUsage: number }[];
  }) => void;
  onCancel: () => void;
}

export const UsageForm: React.FC<UsageFormProps> = ({
  products,
  onSubmit,
  onCancel,
}) => {
  const [date, setDate] = React.useState(new Date());
  const [waterAmount, setWaterAmount] = React.useState(1600);
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([]);
  const [selectedVineyardId, setSelectedVineyardId] = useState<string>('');
  
  const { vineyards } = useVineyardStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!waterAmount || selectedProductIds.length === 0) {
      toast.error('Lütfen su miktarını girin ve en az bir ürün seçin');
      return;
    }

    if (!selectedVineyardId) {
      toast.error('Lütfen bir bağ seçin');
      return;
    }

    const selectedVineyard = vineyards.find(v => v.id === selectedVineyardId);
    if (!selectedVineyard) {
      toast.error('Seçilen bağ bulunamadı');
      return;
    }

    const insufficientStock = selectedProductIds.some(id => {
      const product = products.find(p => p.id === id)!;
      const usage = (waterAmount / 100) * product.dosagePerHundredLt;
      return usage > product.quantity;
    });

    if (insufficientStock) {
      toast.error('Bazı ilaçlar için yeterli stok bulunmuyor!');
      return;
    }

    const selectedProducts = selectedProductIds.map(id => {
      const product = products.find(p => p.id === id)!;
      const calculatedUsage = (waterAmount / 100) * product.dosagePerHundredLt;
      return { id, calculatedUsage };
    });

    onSubmit({
      date,
      vineyardId: selectedVineyard.id,
      vineyardName: selectedVineyard.name,
      totalWaterAmount: waterAmount,
      selectedProducts,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Bağ Seçimi</label>
        <select
          value={selectedVineyardId}
          onChange={(e) => setSelectedVineyardId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Bağ Seçin</option>
          {vineyards.map(vineyard => (
            <option key={vineyard.id} value={vineyard.id}>
              {vineyard.name} ({(vineyard.area / 1000).toFixed(1)} dönüm)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Su Miktarı (Lt)</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            value={waterAmount}
            onChange={e => setWaterAmount(Number(e.target.value))}
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="mt-1 text-sm text-gray-500">
          1 Taral = 1600 Lt
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Kullanılan İlaçlar</label>
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
          {products.map(product => (
            <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={product.id}
                  checked={selectedProductIds.includes(product.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(prev => [...prev, product.id]);
                    } else {
                      setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor={product.id} className="ml-2 block text-sm text-gray-900">
                  {product.name}
                </label>
              </div>
              <div className="text-sm text-gray-500">
                Mevcut: {product.quantity.toFixed(2)} {product.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          İptal
        </button>
      </div>
    </form>
  );
};