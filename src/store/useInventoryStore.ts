import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductFormData, UsageRecord } from '../types/inventory';
import toast from 'react-hot-toast';

interface InventoryState {
  products: Product[];
  usageRecords: UsageRecord[];
  addProduct: (product: ProductFormData) => void;
  updateProduct: (id: string, product: ProductFormData) => void;
  deleteProduct: (id: string) => void;
  recordUsage: (data: {
    totalWaterAmount: number;
    vineyardId: string;
    vineyardName: string;
    selectedProducts: { id: string; calculatedUsage: number }[];
  }) => void;
  setFullState: (state: InventoryState) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      products: [],
      usageRecords: [],

      addProduct: (productData) => {
        const newProduct = {
          ...productData,
          id: crypto.randomUUID(),
          lastUpdated: new Date().toISOString()
        };

        set((state) => ({
          products: [...state.products, newProduct]
        }));
        
        toast.success('Ürün başarıyla eklendi');
      },

      updateProduct: (id, productData) => {
        set((state) => ({
          products: state.products.map(product => 
            product.id === id 
              ? { ...productData, id, lastUpdated: new Date().toISOString() }
              : product
          )
        }));
        
        toast.success('Ürün başarıyla güncellendi');
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter(product => product.id !== id)
        }));
        
        toast.success('Ürün başarıyla silindi');
      },

      recordUsage: (data) => {
        const usageRecord: UsageRecord = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          vineyardId: data.vineyardId,
          vineyardName: data.vineyardName,
          totalWaterAmount: data.totalWaterAmount,
          products: data.selectedProducts.map(sp => {
            const product = useInventoryStore.getState().products.find(p => p.id === sp.id)!;
            return {
              productId: sp.id,
              productName: product.name,
              calculatedUsage: sp.calculatedUsage,
              unit: product.unit
            };
          })
        };

        set((state) => ({
          usageRecords: [...state.usageRecords, usageRecord],
          products: state.products.map(product => {
            const usage = data.selectedProducts.find(p => p.id === product.id);
            if (usage) {
              return {
                ...product,
                quantity: product.quantity - usage.calculatedUsage,
                lastUpdated: new Date().toISOString()
              };
            }
            return product;
          })
        }));

        toast.success('Kullanım kaydı eklendi');
      },

      setFullState: (newState) => {
        set(newState);
      }
    }),
    {
      name: 'inventory-storage',
      version: 1
    }
  )
);