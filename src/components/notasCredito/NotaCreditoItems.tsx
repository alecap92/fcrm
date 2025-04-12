import { Plus, Trash2, Search } from "lucide-react";
import { Button } from "../ui/button";
import type { Product } from "../../types/product";
import { ProductSelectionModal } from "../invoices/ProductSelectionModal";
import { useState } from "react";

interface NotaCreditoItem {
  id: string;
  description: string;
  price_amount: string;
  invoiced_quantity: string;
  notes: string;
  code: string;
  type_item_identification_id: number;
  createdAt: string;
  updatedAt: string;
  line_extension_amount?: string;
}

interface NotaCreditoItemsProps {
  items: NotaCreditoItem[];
  setItems: (items: NotaCreditoItem[]) => void;
}

export function NotaCreditoItems({ items, setItems }: NotaCreditoItemsProps) {
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const calculateLineExtensionAmount = (quantity: string, price: string): string => {
    const qty = Number(quantity) || 0;
    const prc = Number(price) || 0;
    return (qty * prc).toFixed(2);
  };

  const handleAddItem = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const newItem: NotaCreditoItem = {
      id: Date.now().toString(),
      description: "",
      price_amount: "0",
      invoiced_quantity: "1",
      notes: "",
      code: "",
      type_item_identification_id: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      line_extension_amount: "0.00"
    };
    setItems([...items, newItem]);
    setEditingItemIndex(items.length);
    setShowProductModal(true);
  };

  const handleUpdateItemField = (
    index: number,
    field: keyof NotaCreditoItem,
    value: string
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalcular line_extension_amount si se actualiza cantidad o precio
    if (field === 'invoiced_quantity' || field === 'price_amount') {
      updatedItems[index].line_extension_amount = calculateLineExtensionAmount(
        updatedItems[index].invoiced_quantity,
        updatedItems[index].price_amount
      );
    }

    setItems(updatedItems);
  };

  const handleReplaceItem = (index: number, item: NotaCreditoItem) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...item,
      line_extension_amount: calculateLineExtensionAmount(
        item.invoiced_quantity,
        item.price_amount
      )
    };
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSelectProduct = (product: Product) => {
    if (editingItemIndex !== null) {
      console.log('Producto seleccionado:', product); // Para debugging
      
      const updatedItem: NotaCreditoItem = {
        id: Date.now().toString(),
        description: product.name || product.description || "",
        price_amount: product.unitPrice?.toString() || "0",
        invoiced_quantity: "1",
        notes: "",
        code: product.code || "",
        type_item_identification_id: product.type_item_identification_id || 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        line_extension_amount: calculateLineExtensionAmount("1", product.unitPrice?.toString() || "0")
      };

      console.log('Item actualizado:', updatedItem); // Para debugging

      const updatedItems = [...items];
      updatedItems[editingItemIndex] = updatedItem;
      setItems(updatedItems);
    }
    setShowProductModal(false);
    setEditingItemIndex(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">
          Productos y Servicios
        </h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex gap-4 items-start p-4 border rounded-lg"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateItemField(index, "description", e.target.value)
                      }
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
                      value={item.invoiced_quantity}
                      onChange={(e) => 
                        handleUpdateItemField(index, "invoiced_quantity", e.target.value)
                      }
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
                        value={item.price_amount}
                        onChange={(e) => 
                          handleUpdateItemField(index, "price_amount", e.target.value)
                        }
                        className="block w-full pl-7 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Código
                  </label>
                  <input
                    type="text"
                    value={item.code}
                    onChange={(e) =>
                      handleUpdateItemField(index, "code", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notas
                  </label>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) =>
                      handleUpdateItemField(index, "notes", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Línea
                  </label>
                  <div className="mt-1 text-lg font-medium text-gray-900">
                    ${item.line_extension_amount || "0.00"}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => handleRemoveItem(index, e)}
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddItem}
            type="button"
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