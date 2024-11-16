import { StateCreator } from 'zustand';
import { Product, ProductFormData } from '../../types/inventory';

interface ProductSlice {
  products: Product[];
  addProduct: (product: ProductFormData) => void;
  updateProduct: (id: string, product: ProductFormData) => void;
  deleteProduct: (id: string) => void;
  getLowStockProducts: () => Product[];
}

export const createProductSlice: StateCreator<ProductSlice> = (set, get) => ({
  products: [],
  
  addProduct: (productData) => {
    const newProduct = {
      ...productData,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString()
    };
    
    set((state) => ({
      products: [...state.products, newProduct]
    }));
  },

  updateProduct: (id, productData) => {
    set((state) => ({
      products: state.products.map(product => 
        product.id === id 
          ? { ...productData, id, lastUpdated: new Date().toISOString() }
          : product
      )
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter(product => product.id !== id)
    }));
  },

  getLowStockProducts: () => {
    const { products } = get();
    return products.filter(product => {
      const coverageForOneTaral = (1600 / 100) * product.dosagePerHundredLt;
      return product.quantity < coverageForOneTaral;
    });
  }
});