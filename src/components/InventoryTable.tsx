import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { Product } from '../types/inventory';
import { motion } from 'framer-motion';

interface InventoryTableProps {
  data: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const columnHelper = createColumnHelper<Product>();

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(2);
  };

  const columns = [
    columnHelper.accessor('name', {
      header: 'Ürün Adı',
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('category', {
      header: 'Hastalık/Zararlı',
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('quantity', {
      header: 'Miktar',
      cell: info => {
        const value = info.getValue();
        const unit = info.row.original.unit;
        return `${formatNumber(value)} ${unit || ''}`;
      },
    }),
    columnHelper.accessor('dosagePerHundredLt', {
      header: 'Dozaj (100Lt)',
      cell: info => {
        const value = info.getValue();
        const unit = info.row.original.unit;
        return `${formatNumber(value)} ${unit || ''}`;
      },
    }),
    columnHelper.display({
      id: 'coverage',
      header: 'Stok Kapasitesi',
      cell: info => {
        const product = info.row.original;
        const totalWaterCoverage = (product.quantity / product.dosagePerHundredLt) * 100;
        const taralCount = totalWaterCoverage / 1600;
        
        return (
          <div className="text-sm">
            <span className={taralCount < 1 ? 'text-red-600 font-medium' : ''}>
              {taralCount.toFixed(1)} Taral
            </span>
            <span className="text-gray-500 text-xs block">
              ({Math.floor(totalWaterCoverage)} Lt)
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(props.row.original)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Düzenle
          </button>
          <button
            onClick={() => onDelete(props.row.original.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            Sil
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const uniqueCategories = Array.from(new Set(data.map(product => product.category))).filter(Boolean);

  const filteredData = data.filter(product => {
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesSearch = !globalFilter || 
      product.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      product.category.toLowerCase().includes(globalFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Henüz ürün eklenmemiş
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div 
        className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex-1">
          <input
            type="text"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">Tüm Kategoriler</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </motion.div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`
                        px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                        ${header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-100' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <motion.tr 
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-right">
        Toplam {filteredData.length} ürün
      </div>
    </div>
  );
};