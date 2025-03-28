import { Plus, Trash2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import type { Invoice } from '../../types/invoice';
import type { Product } from '../../types/product';
import { ProductSelectionModal } from './ProductSelectionModal';
import { useState } from 'react';

interface InvoiceItemsProps {
  items: Invoice['items'];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof Invoice['items'][0], value: string | number) => void;
  onRemoveItem: (index: number) => void;
}

export function InvoiceItems({ items, onAddItem, onUpdateItem, onRemoveItem }: InvoiceItemsProps) {
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const handleSelectProduct = (product: Product) => {
    if (editingItemIndex !== null) {
      // Update the item with the product details
      const updates = {
        name: product.name,
        description: product.description || '',
        unitPrice: product.unitPrice,
        tax: product.taxes || 0,
      };

      // Update each field individually
      Object.entries(updates).forEach(([field, value]) => {
        onUpdateItem(editingItemIndex, field as keyof Invoice['items'][0], value);
      });

      // Calculate and update the total
      const quantity = items[editingItemIndex].quantity || 1;
      const subtotal = quantity * product.unitPrice;
      const tax = product.taxes ? (subtotal * product.taxes) / 100 : 0;
      onUpdateItem(editingItemIndex, 'total', subtotal + tax);

      // Log for debugging
      console.log('Selected product:', product);
      console.log('Updated item:', {
        ...items[editingItemIndex],
        ...updates,
        total: subtotal + tax
      });
    }
    setShowProductModal(false);
    setEditingItemIndex(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Productos y Servicios</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                      className="block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                      placeholder="Buscar o escribir descripción..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemIndex(index);
                        setShowProductModal(true);
                      }}
                      className="absolute inset-y-0 right-0 px-3 flex items-center bg-gray-50 rounded-r-md border-l hover:bg-gray-100"
                    >
                      <Search className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(index, 'quantity', Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Precio Unitario
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => onUpdateItem(index, 'unitPrice', Number(e.target.value))}
                        className="block w-full pl-7 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descuento
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => onUpdateItem(index, 'discount', Number(e.target.value))}
                        className="block w-full pl-7 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Impuesto
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.tax}
                        onChange={(e) => onUpdateItem(index, 'tax', Number(e.target.value))}
                        className="block w-full pl-7 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total
                  </label>
                  <div className="mt-1 text-lg font-medium text-gray-900">
                    ${item.total.toLocaleString()}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onRemoveItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onAddItem();
              setEditingItemIndex(items.length);
              setShowProductModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Item
          </Button>
        </div>
      </div>

      <ProductSelectionModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingItemIndex(null);
        }}
        onSelect={handleSelectProduct}
      />
    </div>
  );
}