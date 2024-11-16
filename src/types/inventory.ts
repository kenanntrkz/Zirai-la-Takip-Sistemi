export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  activeIngredient: string;
  dosagePerHundredLt: number;
  lastUpdated: string;
}

export type ProductFormData = Omit<Product, 'id' | 'lastUpdated'>;

export interface UsageProduct {
  productId: string;
  productName: string;
  calculatedUsage: number;
  unit: string;
}

export interface UsageRecord {
  id: string;
  date: string;
  vineyardId: string;
  vineyardName: string;
  totalWaterAmount: number;
  products: UsageProduct[];
}

export interface UsageStats {
  monthlyUsage: { month: string; totalWater: number }[];
  topProducts: { name: string; totalUsage: number; unit: string }[];
}