import { StateCreator } from 'zustand';
import { UsageRecord, UsageStats } from '../../types/inventory';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface UsageSlice {
  usageRecords: UsageRecord[];
  addUsageRecord: (record: Omit<UsageRecord, 'id'>) => void;
  getUsageStats: () => UsageStats;
}

export const createUsageSlice: StateCreator<UsageSlice> = (set, get) => ({
  usageRecords: [],

  addUsageRecord: (recordData) => {
    const newRecord = {
      ...recordData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };

    set((state) => ({
      usageRecords: [...state.usageRecords, newRecord]
    }));
  },

  getUsageStats: () => {
    const { usageRecords } = get();
    
    const monthlyUsage = usageRecords.reduce((acc, record) => {
      try {
        const date = parseISO(record.date);
        const month = format(date, 'MMMM yyyy', { locale: tr });
        const existing = acc.find(item => item.month === month);
        
        if (existing) {
          existing.totalWater += record.totalWaterAmount;
        } else {
          acc.push({ month, totalWater: record.totalWaterAmount });
        }
      } catch (error) {
        console.error('Error processing date:', error);
      }
      
      return acc;
    }, [] as { month: string; totalWater: number }[]);

    const productUsage = usageRecords.reduce((acc, record) => {
      record.products.forEach(product => {
        const existing = acc.find(item => item.name === product.productName);
        
        if (existing) {
          existing.totalUsage += product.calculatedUsage;
        } else {
          acc.push({
            name: product.productName,
            totalUsage: product.calculatedUsage,
            unit: product.unit
          });
        }
      });
      
      return acc;
    }, [] as { name: string; totalUsage: number; unit: string }[]);

    const topProducts = productUsage
      .sort((a, b) => b.totalUsage - a.totalUsage)
      .slice(0, 5);

    return {
      monthlyUsage,
      topProducts
    };
  }
});