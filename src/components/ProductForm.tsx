import React, { useState, useEffect } from 'react';
import { ProductFormData } from '../types/inventory';
import toast from 'react-hot-toast';
import { useInventoryStore } from '../store/useInventoryStore';

interface ProductSuggestion {
  name: string;
  activeIngredient: string;
  dosagePerHundredLt: number;
  category: string;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: '',
      category: '',
      quantity: 0,
      unit: 'L',
      dosagePerHundredLt: 0,
      activeIngredient: '',
    }
  );

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { products } = useInventoryStore();

  // İlk yükleme ve initialData değişiminde formu güncelle
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Ürün adı yazıldıkça önerileri güncelle
  const searchProducts = (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    console.log('Searching products:', query);
    console.log('Available products:', products);

    const matches = products.filter(product => 
      product.name?.toLowerCase().includes(query.toLowerCase())
    );

    console.log('Matches found:', matches);

    const uniqueMatches = Array.from(new Set(matches.map(p => p.name))).map(name => {
      const product = matches.find(p => p.name === name)!;
      return {
        name: product.name,
        activeIngredient: product.activeIngredient || '',
        dosagePerHundredLt: product.dosagePerHundredLt,
        category: product.category
      };
    });

    console.log('Unique matches:', uniqueMatches);
    setSuggestions(uniqueMatches);
    setShowSuggestions(uniqueMatches.length > 0);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    searchProducts(value);
  };

  const handleSuggestionClick = (suggestion: ProductSuggestion) => {
    console.log('Selected suggestion:', suggestion);
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      activeIngredient: suggestion.activeIngredient,
      dosagePerHundredLt: suggestion.dosagePerHundredLt,
      category: suggestion.category
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!formData.name.trim()) {
        toast.error('Lütfen ürün adını girin');
        return;
      }

      if (!formData.activeIngredient.trim()) {
        toast.error('Lütfen etken maddeyi girin');
        return;
      }

      if (!formData.category) {
        toast.error('Lütfen hastalık/zararlı seçin');
        return;
      }

      if (formData.quantity <= 0) {
        toast.error('Miktar 0\'dan büyük olmalıdır');
        return;
      }

      if (formData.dosagePerHundredLt <= 0) {
        toast.error('Dozaj 0\'dan büyük olmalıdır');
        return;
      }

      const cleanedData: ProductFormData = {
        name: formData.name.trim(),
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        dosagePerHundredLt: Number(formData.dosagePerHundredLt),
        activeIngredient: formData.activeIngredient.trim(),
      };

      onSubmit(cleanedData);
    } catch (error) {
      console.error('Form submit error:', error);
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          onFocus={() => {
            if (formData.name.length >= 2) {
              searchProducts(formData.name);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          minLength={2}
          maxLength={100}
          disabled={isSubmitting}
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="font-medium">{suggestion.name}</div>
                <div className="text-sm text-gray-600">
                  {suggestion.activeIngredient} - {suggestion.dosagePerHundredLt} {formData.unit}/100L
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Etken Madde</label>
        <input
          type="text"
          value={formData.activeIngredient}
          onChange={e => setFormData(prev => ({ ...prev, activeIngredient: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Hastalık/Zararlı</label>
        <select
          value={formData.category}
          onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          disabled={isSubmitting}
        >
          <option value="">Seçiniz</option>
          <option value="Külleme">Külleme</option>
          <option value="Kurşuni Küf">Kurşuni Küf</option>
          <option value="Mildiyö">Mildiyö</option>
          <option value="Kırmızı Örümcek">Kırmızı Örümcek</option>
          <option value="Unlu Bit">Unlu Bit</option>
          <option value="Kurt (Larva)">Kurt (Larva)</option>
          <option value="Kurt (Canlı)">Kurt (Canlı)</option>
          <option value="Ölükol">Ölükol</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Miktar</label>
          <input
            type="number"
            value={formData.quantity}
            onChange={e => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0.01"
            step="0.01"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Birim</label>
          <select
            value={formData.unit}
            onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          >
            <option value="L">Litre</option>
            <option value="KG">Kilogram</option>
            <option value="ML">Mililitre</option>
            <option value="GR">Gram</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dozaj (100 Lt suya)</label>
        <input
          type="number"
          value={formData.dosagePerHundredLt}
          onChange={e => setFormData(prev => ({ ...prev, dosagePerHundredLt: Number(e.target.value) }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min="0.01"
          step="0.01"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          İptal
        </button>
      </div>
    </form>
  );
};