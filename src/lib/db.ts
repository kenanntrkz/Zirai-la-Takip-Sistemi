import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, UsageRecord } from '../types/inventory';

interface InventoryDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-name': string };
  };
  usage_records: {
    key: string;
    value: UsageRecord;
    indexes: { 'by-date': string };
  };
}

const DB_NAME = 'agricultural-inventory';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<InventoryDB>> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<InventoryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('by-name', 'name');
        }
        if (!db.objectStoreNames.contains('usage_records')) {
          const usageStore = db.createObjectStore('usage_records', { keyPath: 'id' });
          usageStore.createIndex('by-date', 'date');
        }
      },
    });
  }
  return dbPromise;
};

export const db = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const db = await getDB();
      return await db.getAll('products');
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Ürünler yüklenirken bir hata oluştu');
    }
  },

  async addProduct(product: Product): Promise<void> {
    try {
      const db = await getDB();
      await db.add('products', product);
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Ürün eklenirken bir hata oluştu');
    }
  },

  async updateProduct(product: Product): Promise<void> {
    try {
      const db = await getDB();
      await db.put('products', product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Ürün güncellenirken bir hata oluştu');
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete('products', id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Ürün silinirken bir hata oluştu');
    }
  },

  async getAllUsageRecords(): Promise<UsageRecord[]> {
    try {
      const db = await getDB();
      return await db.getAll('usage_records');
    } catch (error) {
      console.error('Error getting usage records:', error);
      throw new Error('Kullanım kayıtları yüklenirken bir hata oluştu');
    }
  },

  async addUsageRecord(record: UsageRecord): Promise<void> {
    try {
      const db = await getDB();
      await db.add('usage_records', record);
    } catch (error) {
      console.error('Error adding usage record:', error);
      throw new Error('Kullanım kaydı eklenirken bir hata oluştu');
    }
  }
};