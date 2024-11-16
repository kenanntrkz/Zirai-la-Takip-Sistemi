import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vineyard, VineyardFormData } from '../types/vineyard';
import toast from 'react-hot-toast';

interface VineyardState {
  vineyards: Vineyard[];
  addVineyard: (vineyard: VineyardFormData) => void;
  updateVineyard: (id: string, vineyard: VineyardFormData) => void;
  deleteVineyard: (id: string) => void;
  getVineyard: (id: string) => Vineyard | undefined;
}

export const useVineyardStore = create<VineyardState>()(
  persist(
    (set, get) => ({
      vineyards: [],

      addVineyard: (vineyardData) => {
        const newVineyard: Vineyard = {
          ...vineyardData,
          id: crypto.randomUUID(),
          area: calculateArea(vineyardData.coordinates),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          vineyards: [...state.vineyards, newVineyard]
        }));
        
        toast.success('Bağ başarıyla eklendi');
      },

      updateVineyard: (id, vineyardData) => {
        set((state) => ({
          vineyards: state.vineyards.map(vineyard => 
            vineyard.id === id 
              ? {
                  ...vineyardData,
                  id,
                  area: calculateArea(vineyardData.coordinates),
                  createdAt: vineyard.createdAt,
                  updatedAt: new Date().toISOString()
                }
              : vineyard
          )
        }));
        
        toast.success('Bağ başarıyla güncellendi');
      },

      deleteVineyard: (id) => {
        set((state) => ({
          vineyards: state.vineyards.filter(vineyard => vineyard.id !== id)
        }));
        
        toast.success('Bağ başarıyla silindi');
      },

      getVineyard: (id) => {
        return get().vineyards.find(vineyard => vineyard.id === id);
      }
    }),
    {
      name: 'vineyard-storage',
      version: 1
    }
  )
);

// Alan hesaplama fonksiyonu (m²)
function calculateArea(coordinates: { lat: number; lng: number; }[]): number {
  if (coordinates.length < 3) return 0;
  
  // Basit poligon alan hesaplama formülü (Shoelace formula)
  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    area += coordinates[i].lat * coordinates[j].lng;
    area -= coordinates[j].lat * coordinates[i].lng;
  }
  
  area = Math.abs(area) / 2;
  // Yaklaşık olarak metrekareye çevirme (enlem/boylam -> metre)
  return Math.round(area * 111319.9);
}