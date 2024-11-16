import React from 'react';

interface HeaderProps {
  onAddClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddClick }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Zirai İlaç Stok Takip Sistemi
      </h1>
      <button
        onClick={onAddClick}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Yeni Ürün Ekle
      </button>
    </div>
  );
};