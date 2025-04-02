import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Package,
  Archive,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import { ProductForm } from "../components/products/ProductForm";
import type { Product } from "../types/product";
import productsService from "../services/productsService";
import { useToast } from "../components/ui/toast";
import { useDebouncer } from "../hooks/useDebbouncer";

export function Products() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const toast = useToast();
  const debouncedSearch = useDebouncer(searchTerm, 500);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsService.getProducts(
        currentPage,
        itemsPerPage
      );
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.totalProducts || 0);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.show({
        title: "Error",
        description: "Failed to load products",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchHandle = async () => {
    try {
      setIsLoading(true);
      const response = await productsService.searchProducts(debouncedSearch);
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.totalProducts || 0);
    } catch (error) {
      console.error("Error searching products:", error);
      toast.show({
        title: "Error",
        description: "Failed to search products",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch) {
      searchHandle();
    } else {
      loadProducts();
    }
  }, [debouncedSearch, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productsService.deleteProduct(productId);
      setProducts(products.filter((p) => p._id !== productId));
      toast.show({
        title: "Success",
        description: "Product deleted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.show({
        title: "Error",
        description: "Failed to delete product",
        type: "error",
      });
    }
    setShowDeleteDialog(false);
    setProductToDelete(null);
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      const response = await productsService.createProduct(productData);
      setProducts([...products, response]);
      setShowProductForm(false);
      setEditingProduct(undefined);
      toast.show({
        title: "Success",
        description: "Product created successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating product:", error);
      toast.show({
        title: "Error",
        description: "Failed to create product",
        type: "error",
      });
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;

    try {
      const response = await productsService.updateProduct(
        editingProduct._id,
        productData
      );
      setProducts(
        products.map((p) => (p._id === editingProduct._id ? response : p))
      );
      setShowProductForm(false);
      setEditingProduct(undefined);
      toast.show({
        title: "Success",
        description: "Product updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast.show({
        title: "Error",
        description: "Failed to update product",
        type: "error",
      });
    }
  };

  const handleSubmit = (productData: any) => {
    if (editingProduct) {
      handleUpdateProduct(productData);
    } else {
      handleCreateProduct(productData);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Productos
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {totalProducts} productos en total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 rounded-lg p-1 flex items-center">
                <button
                  className={`p-1.5 rounded ${
                    viewMode === "grid"
                      ? "bg-white shadow"
                      : "hover:bg-white/50"
                  }`}
                  onClick={() => setViewMode("grid")}
                  title="Vista Cuadrícula"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  className={`p-1.5 rounded ${
                    viewMode === "list"
                      ? "bg-white shadow"
                      : "hover:bg-white/50"
                  }`}
                  onClick={() => setViewMode("list")}
                  title="Vista Lista"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={() => {
                  setEditingProduct(undefined);
                  setShowProductForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de precios
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="rounded-lg border-gray-300"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="rounded-lg border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
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
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.description}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-gray-900">
                      ${product.unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setProductToDelete(product._id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impuestos
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                  <th className="px-6 py-3 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.unitPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.taxes}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(product.updatedAt), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setProductToDelete(product._id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Archive className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border-gray-300 text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
            <span className="text-sm text-gray-500">
              Mostrando{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalProducts)} a{" "}
              {Math.min(currentPage * itemsPerPage, totalProducts)} de{" "}
              {totalProducts} productos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="min-w-[2.5rem]"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eliminar Producto
            </h3>
            <p className="text-gray-500 mb-4">
              ¿Estás seguro de que quieres eliminar este producto? Esta acción
              no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteProduct(productToDelete!)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <ProductForm
                product={editingProduct}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(undefined);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
