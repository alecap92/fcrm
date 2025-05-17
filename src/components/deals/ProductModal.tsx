import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import productsService from "../../services/productsService";

export interface Product {
  _id: string;
  name: string;
  unitPrice: number;
  quantity?: number;
  hasVariants?: boolean;
  selectedVariant?: {
    _id: string;
    attributeValues: any[];
    price: number;
  };
}

interface Variant {
  _id: string;
  attributeValues: {
    _id: string;
    value: string;
  }[];
}

interface ProductForm {
  productId: string;
  productName: string;
  variantId: string | undefined;
  quantity: string;
  priceAtAcquisition: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: any) => void;
}

export function ProductModal({ isOpen, onClose, onSelect }: ProductModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [form, setForm] = useState<ProductForm>({
    productId: "",
    productName: "",
    variantId: undefined,
    quantity: "",
    priceAtAcquisition: "",
  });

  const fetchProducts = async () => {
    try {
      const response: any = await productsService.getProducts(1, 100);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const fetchVariants = async (productId: string) => {
    try {
      const response: any = await productsService.getProductVariants(productId);
      setVariants(response.data);
    } catch (error) {
      console.error("Error loading variants:", error);
      setVariants([]);
    }
  };

  const handleAddProduct = () => {
    if (!form.productId || !form.quantity || !form.priceAtAcquisition) {
      return;
    }

    if (selectedProduct?.hasVariants && !form.variantId) {
      return;
    }

    onSelect(form);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      productId: "",
      productName: "",
      variantId: undefined,
      quantity: "",
      priceAtAcquisition: "",
    });
    setSelectedProduct(null);
    setVariants([]);
  };

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    } else {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProduct) {
      fetchVariants(selectedProduct._id);
    } else {
      setVariants([]);
    }
  }, [selectedProduct]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div
        className="bg-white rounded-xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Seleccionar producto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex gap-2">
            <select
              value={form.productId}
              onChange={(e) => {
                const product = products.find((p) => p._id === e.target.value);
                setSelectedProduct(product || null);
                setForm({
                  ...form,
                  productId: e.target.value,
                  productName: product?.name || "",
                  variantId: undefined, // Reset variant when product changes
                });
              }}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg"
            >
              <option value="">Seleccione el producto</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            {selectedProduct?.hasVariants && (
              <select
                value={form.variantId}
                onChange={(e) =>
                  setForm({ ...form, variantId: e.target.value })
                }
                className="w-full p-2 text-sm border border-gray-200 rounded-lg"
              >
                <option value="">Seleccione la variante</option>
                {variants.map((variant) => (
                  <option key={variant._id} value={variant._id}>
                    {variant.attributeValues[0]?.value}
                  </option>
                ))}
              </select>
            )}
            <input
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              value={form.quantity}
              type="number"
              placeholder="Cantidad"
              className="w-full p-2 text-sm border border-gray-200 rounded-lg"
            />
            <input
              value={form.priceAtAcquisition}
              onChange={(e) =>
                setForm({ ...form, priceAtAcquisition: e.target.value })
              }
              type="number"
              placeholder="Precio de adquisición"
              className="w-full p-2 text-sm border border-gray-200 rounded-lg"
            />
            <button
              onClick={handleAddProduct}
              disabled={
                !form.productId ||
                !form.quantity ||
                !form.priceAtAcquisition ||
                (selectedProduct?.hasVariants && !form.variantId)
              }
              className="flex-1 p-2 text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} className="inline mr-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
