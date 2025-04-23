import { useState, useEffect } from "react";
import { Search, Package, X, Plus } from "lucide-react";
import { Button } from "../ui/button";
import type { Product } from "../../types/product";
import productsService from "../../services/productsService";
import { useDebouncer } from "../../hooks/useDebbouncer";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

export function ProductSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebouncer(searchTerm, 500);

  useEffect(() => {
    const searchProducts = async () => {
      try {
        setIsLoading(true);
        if (debouncedSearch) {
                
          const response:any = await productsService.searchProducts(
            debouncedSearch
          );



          setProducts(response.data || []);
        } else {
          const response = await productsService.getProducts(1, 100);

          setProducts(response.data.products || []);
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Seleccionar Producto
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-action"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <button
                  key={product._id}
                  className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    onSelect(product);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${product?.unitPrice?.toLocaleString()}
                      </div>
                      {product.taxes && (
                        <div className="text-xs text-gray-500">
                          +{product.taxes}% impuestos
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-gray-50">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>
    </div>
  );
}
