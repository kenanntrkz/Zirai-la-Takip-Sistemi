import React, { useState } from 'react';
import { VineyardFormData } from '../types/vineyard';
import { VineyardMap } from './VineyardMap';
import toast from 'react-hot-toast';

interface VineyardFormProps {
  initialData?: VineyardFormData;
  onSubmit: (data: VineyardFormData) => void;
  onCancel: () => void;
}

export const VineyardForm: React.FC<VineyardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<VineyardFormData>(
    initialData || {
      name: '',
      parcelInfo: {
        ada: '',
        parcel: ''
      },
      coordinates: [],
      grapeType: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Lütfen bağ adını girin');
      return;
    }

    if (!formData.parcelInfo.ada || !formData.parcelInfo.parcel) {
      toast.error('Lütfen ada ve parsel bilgilerini girin');
      return;
    }

    if (formData.coordinates.length < 3) {
      toast.error('Lütfen haritada en az 3 nokta işaretleyin');
      return;
    }

    if (!formData.grapeType.trim()) {
      toast.error('Lütfen üzüm çeşidini girin');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Bağ Adı</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ada No</label>
          <input
            type="text"
            value={formData.parcelInfo.ada}
            onChange={e => setFormData(prev => ({
              ...prev,
              parcelInfo: { ...prev.parcelInfo, ada: e.target.value }
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Parsel No</label>
          <input
            type="text"
            value={formData.parcelInfo.parcel}
            onChange={e => setFormData(prev => ({
              ...prev,
              parcelInfo: { ...prev.parcelInfo, parcel: e.target.value }
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bağ Sınırları</label>
        <VineyardMap
          coordinates={formData.coordinates}
          onChange={coordinates => setFormData(prev => ({ ...prev, coordinates }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Üzüm Çeşidi</label>
        <input
          type="text"
          value={formData.grapeType}
          onChange={e => setFormData(prev => ({ ...prev, grapeType: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
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