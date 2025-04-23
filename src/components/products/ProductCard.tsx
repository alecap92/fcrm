import { Package, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {

    return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="aspect-square relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 hover:bg-white"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        {product.hasVariants && (
          <div className="absolute top-2 left-2  text-white px-2 py-1 rounded-md">
            <Badge >Variantes</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {product.description}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-gray-900">
            ${product.unitPrice?.toFixed(2) || "0.00"}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(product._id || "")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 