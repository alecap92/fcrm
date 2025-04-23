import { useEffect, useState } from 'react';
import { 
  X,
  Plus,
  Upload,
  Trash2,
  Check} from 'lucide-react';
import { Button } from '../ui/button';
import type { Product, ProductAttribute } from '../../types/product';
import productsService from '../../services/productsService';

interface ProductFormProps {
  product?: Product;
  onSubmit: any;
  onCancel: () => void;
  isEditing: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isEditing }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    unitPrice: product?.unitPrice || 0,
    code: product?.code || '',
    type_item_identification_id: product?.type_item_identification_id || 0,
    taxes: product?.taxes || 0,
    hasVariants: product?.hasVariants || false,
    attributes: product?.attributes || [],
    variants: product?.variants || [],
    imageUrl: product?.imageUrl || ''
  });

  const [newAttribute, setNewAttribute] = useState<ProductAttribute>({
    attributeName: '',
    value: '',
    price: 0,
    imageUrl: '',
    id: ''
  });

  const [editingField, setEditingField] = useState<{id: string, field: 'attributeName' | 'value' | 'price' | 'imageUrl'} | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    onSubmit(formData);
  };

  const handleAddAttribute = () => {
    if (!newAttribute.attributeName) return;

    
    const attribute: ProductAttribute = {
      id: Date.now().toString(),
      attributeName: newAttribute.attributeName,
      value: newAttribute.value,
      price: newAttribute.price,
      imageUrl: newAttribute.imageUrl
    };

    setFormData({
      ...formData,
      attributes: [...formData.attributes, attribute]
    });

    setNewAttribute({ attributeName: '', value: '', price: 0, imageUrl: '', id: '' });
  };

  const handleRemoveAttribute = (attributeId: string) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter(attr => attr.id !== attributeId)
    });
  };

  const handleDoubleClick = (attributeId: string, field: 'attributeName' | 'value' | 'price' | 'imageUrl', value: string | number) => {
    if (!attributeId || !field) return;
    setEditingField({ id: attributeId, field });
    setEditValue(value?.toString() || '');
  };

  const handleSaveEdit = (attributeId: string) => {
    if (!editingField || !attributeId) return;
    try {
      const updatedAttributes = formData.attributes.map(attr => {
        if (attr.id === attributeId) {
          const newValue = editingField.field === 'price' 
            ? Number(editValue) || 0 
            : editValue.trim();
            
          return { ...attr, [editingField.field]: newValue };
        }
        return attr;
      });

      setFormData({ ...formData, attributes: updatedAttributes });
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Error al guardar la edición:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const loadProductVariants = async () => {
    const response = await productsService.getProductVariants(product?._id || "");
    
    // Transformar los datos de variantes al formato que espera tu componente
    const formattedAttributes = response.data.map((variant:any) => {
      // Tomamos el primer attributeValue (parece que cada variante tiene solo uno)
      const attrValue = variant.attributeValues[0];
      
      return {
        id: attrValue.valueId, // O podrías usar variant._id
        attributeName: attrValue.attributeName,
        value: attrValue.value,
        price: attrValue.price || variant.price,
        imageUrl: attrValue.imageUrl || variant.imageUrl
      };
    });
    
    setFormData({ ...formData, attributes: formattedAttributes });
  }

  useEffect(() => {
    if (isEditing) {
      loadProductVariants();
    }
  }, [isEditing]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-12 md:grid-cols-12 gap-6">
        <div className="space-y-6 col-span-6">
          {/* Images */}
          <div>
          
            <div className="border-2 border-dashed rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700">Imagen General</label>
              <input 
                type="text" 
                id="imageUrl" 
                name="imageUrl" 
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                value={formData.imageUrl} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
          {/* Basic Information */}
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-5 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                      className="col-span-5 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="col-span-5 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                  
                />
              </div>
            </div>
          </div>
          {/* Pricing */}
          <div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                      className="col-span-5 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-6 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Impuesto
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.taxes}
                      onChange={(e) => setFormData({ ...formData, taxes: Number(e.target.value) })}
                      className="col-span-5 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-6 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 col-span-6">
          
           {/* Variants Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              ¿Este producto tiene variantes?
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, hasVariants: !formData.hasVariants })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                formData.hasVariants ? 'bg-action' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  formData.hasVariants ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
           {/* Add New Attribute */}
             <div className="space-y-2">
             {
               formData.hasVariants && 
                <div className="grid gap-2 justify-items-center items-center">
                  <input
                    type="text"
                    placeholder="Categoria...Ej: Color"
                    value={newAttribute.attributeName}
                    onChange={(e) => setNewAttribute({ ...newAttribute, attributeName: e.target.value })}
                    className="col-span-6 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Atributo... Ej: Rojo"
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                    className="col-span-6 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                  />
                  <div className="mt-1 relative rounded-md shadow-sm col-span-6">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio... Ej: 10000"
                      value={newAttribute.price}
                      onChange={(e) => setNewAttribute({ ...newAttribute, price: Number(e.target.value) })}
                      className="col-span-12 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-6 py-2"
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="URL de la imagen"
                    value={newAttribute.imageUrl}
                    onChange={(e) => setNewAttribute({ ...newAttribute, imageUrl: e.target.value })}
                    className="col-span-6 mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                  />  
                  <Button
                    type="button"
                    onClick={handleAddAttribute}
                    className="col-span-12 mt-2 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar atributo
                  </Button>
                </div>
            }
            </div>
          {/* Variants Section */}
          {formData.hasVariants && (
            <div className="space-y-4">
              {/* Existing Attributes */}
              <table className="w-full">
                <thead className="bg-gray-300">
                  <tr className="text-left">
                    <th className="p-2">Atributo</th>
                    <th className="p-2">Valores</th>
                    <th className="p-2">Precio</th>
                    <th className="p-2">Imagen</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.attributes.map((attribute) => (
                    <tr key={attribute.id}>
                      <td className="p-2">
                        {editingField?.id === attribute.id && editingField?.field === 'attributeName' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(attribute.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onDoubleClick={() => handleDoubleClick(attribute.id, 'attributeName', attribute.attributeName)}
                            className="cursor-pointer"
                          >
                            {attribute.attributeName}
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        {editingField?.id === attribute.id && editingField?.field === 'value' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(attribute.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span
                              onDoubleClick={() => handleDoubleClick(attribute.id, 'value', attribute.value)}
                            className="cursor-pointer"
                          >
                            {attribute.value}
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        {editingField?.id === attribute.id && editingField?.field === 'price' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(attribute.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onDoubleClick={() => handleDoubleClick(attribute.id, 'price', attribute.price)}
                            className="cursor-pointer"
                          >
                            {attribute.price}
                          </span>
                        )}
                      
                      </td>
                      <td className="p-2">
                        {editingField?.id === attribute.id && editingField?.field === 'imageUrl' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(attribute.id)}
                              className="text-green-600 hover:text-green-800" 
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span 
                            onDoubleClick={() => handleDoubleClick(attribute.id, 'imageUrl', attribute.imageUrl)}
                            className="cursor-pointer"
                          >
                            {attribute.imageUrl}
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(attribute.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Upload className="w-4 h-4 mr-2" />
          {product ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>
    </form>
  );
}