import React from 'react';
import { useInventoryStore } from '../store/useInventoryStore';

export const Notifications: React.FC = () => {
  const { products } = useInventoryStore();
  
  const productsWithCoverage = products.map(product => {
    const coverageForOneTaral = (1600 / 100) * product.dosagePerHundredLt;
    const totalWaterCoverage = (product.quantity / product.dosagePerHundredLt) * 100;
    const taralCount = totalWaterCoverage / 1600;
    return {
      ...product,
      coverageForOneTaral,
      totalWaterCoverage,
      taralCount
    };
  });

  const lowStockProducts = productsWithCoverage.filter(product => 
    product.quantity < product.coverageForOneTaral
  );

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Düşük Stok Uyarısı</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">Aşağıdaki ürünlerin stok miktarı 1 tarallık ilaçlama için gereken miktarın altında:</p>
            <ul className="list-disc pl-5 space-y-1">
              {lowStockProducts.map(product => (
                <li key={product.id}>
                  <strong>{product.name}:</strong> Mevcut {product.quantity.toFixed(2)} {product.unit}
                  <ul className="ml-2 mt-1 text-xs">
                    <li>• 1 Taral için gereken: {product.coverageForOneTaral.toFixed(2)} {product.unit}</li>
                    <li>• Mevcut stok {Math.floor(product.totalWaterCoverage)} Lt suya denk geliyor</li>
                    <li>• Yaklaşık {product.taralCount.toFixed(1)} tarallık ilaç mevcut</li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};