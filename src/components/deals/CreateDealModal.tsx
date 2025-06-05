import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Calendar,
  User,
  Search,
  FileText,
  Currency,
  Package,
  DollarSign,
  Database,
  Minus,
  Edit2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { format } from "date-fns";
import { contactsService } from "../../services/contactsService";
import { dealsService } from "../../services/dealsService";
import { normalizeContact } from "../../lib/parseContacts";
import type { Contact } from "../../types/contact";
import { ProductModal } from "./ProductModal";
import { useDeals } from "../../contexts/DealsContext";
import productsService from "../../services/productsService";

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deal: any) => void;
  initialStage?: string;
  initialData?: any;
}

interface DealField {
  _id: string;
  type: string;
  name: string;
  key: string;
  required: boolean;
  options?: string[];
}

interface productAcquisition {
  productId: string;
  variantId: string | undefined;
  quantity: number;
  priceAtAcquisition: number;
  productName: string;
}

export function CreateDealModal({
  isOpen,
  onClose,
  onSubmit,
  initialStage = "",
  initialData = null,
}: CreateDealModalProps) {
  // Usar el contexto para obtener datos compartidos
  const { columns: stages, pipelineId } = useDeals();

  const [formData, setFormData] = useState({
    name: "",
    value: "",
    stage: initialStage,
    expectedCloseDate: format(new Date(), "yyyy-MM-dd"),
    contact: {
      id: "",
      name: "",
      email: "",
      phone: "",
    },
    fields: {} as Record<string, string>,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactResults, setShowContactResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [customFields, setCustomFields] = useState<DealField[]>([]);
  const [products, setProducts] = useState<productAcquisition[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [additionalFields, setAdditionalFields] = useState<
    Array<{ fieldId: string; value: string }>
  >([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [variantNames, setVariantNames] = useState<Record<string, string>>({});

  // Función helper para obtener el nombre de una variante
  const getVariantName = async (
    productId: string,
    variantId: string
  ): Promise<string> => {
    try {
      // Verificar si ya tenemos el nombre en cache
      if (variantNames[variantId]) {
        return variantNames[variantId];
      }

      const response = await productsService.getProductVariants(productId);
      const variant = response.data.find((v: any) => v._id === variantId);

      if (
        variant &&
        variant.attributeValues &&
        variant.attributeValues.length > 0
      ) {
        const variantName = variant.attributeValues[0].value;

        // Guardar en cache para evitar llamadas futuras
        setVariantNames((prev) => ({
          ...prev,
          [variantId]: variantName,
        }));

        return variantName;
      }

      return variantId; // Fallback al ID si no se encuentra el nombre
    } catch (error) {
      console.error("Error obteniendo nombre de variante:", error);
      return variantId; // Fallback al ID en caso de error
    }
  };

  // Cargar nombres de variantes cuando se cargan productos
  useEffect(() => {
    const loadVariantNames = async () => {
      const variantPromises = products
        .filter((product) => product.variantId)
        .map(async (product) => {
          const variantName = await getVariantName(
            product.productId,
            product.variantId!
          );
          return { variantId: product.variantId!, variantName };
        });

      const variantResults = await Promise.all(variantPromises);
      const newVariantNames: Record<string, string> = {};

      variantResults.forEach(({ variantId, variantName }) => {
        newVariantNames[variantId] = variantName;
      });

      setVariantNames((prev) => ({ ...prev, ...newVariantNames }));
    };

    if (products.length > 0) {
      loadVariantNames();
    }
  }, [products]);

  useEffect(() => {
    const loadCustomFields = async () => {
      try {
        const fieldsResponse = await dealsService.getDealsFields(pipelineId);
        setCustomFields(fieldsResponse.data || []);

        // Initialize fields in formData
        const initialFields = fieldsResponse.data.reduce(
          (acc: Record<string, string>, field: DealField) => {
            acc[field.key] = "";
            return acc;
          },
          {}
        );

        setFormData((prev) => ({
          ...prev,
          fields: initialFields,
        }));
      } catch (error) {
        console.error("Error loading custom fields:", error);
      }
    };

    if (pipelineId) {
      loadCustomFields();
    }
  }, [pipelineId]);

  useEffect(() => {
    if (initialData && isOpen) {
      // Marcar que estamos en modo edición
      setIsEditMode(true);

      // Cargar los datos del negocio para edición
      const dealFields =
        initialData.fields?.reduce(
          (acc: Record<string, string>, field: any) => {
            if (field.field?.key) {
              acc[field.field.key] = field.value || "";
            }
            return acc;
          },
          {}
        ) || {};

      // Procesar el contacto usando normalizeContact si tiene la estructura con properties
      let contactData = { id: "", name: "", email: "", phone: "" };

      if (initialData.associatedContactId) {
        // Verificar si el contacto tiene la estructura completa con properties
        if (initialData.associatedContactId.properties) {
          const normalizedContact = normalizeContact(
            initialData.associatedContactId
          );
          contactData = {
            id: normalizedContact._id,
            name: `${normalizedContact.firstName} ${normalizedContact.lastName}`,
            email: normalizedContact.email || "",
            phone: normalizedContact.phone || normalizedContact.mobile || "",
          };

          // También actualizar el searchTerm para mostrar el nombre en el campo
          setSearchTerm(
            `${normalizedContact.firstName} ${normalizedContact.lastName}`
          );
        } else {
          // Caso cuando solo tenemos el ID o una estructura simplificada
          contactData = {
            id:
              initialData.associatedContactId._id ||
              initialData.associatedContactId,
            name: initialData.associatedContactId.firstName
              ? `${initialData.associatedContactId.firstName} ${
                  initialData.associatedContactId.lastName || ""
                }`
              : "",
            email: initialData.associatedContactId.email || "",
            phone:
              initialData.associatedContactId.phone ||
              initialData.associatedContactId.mobile ||
              "",
          };

          if (initialData.associatedContactId.firstName) {
            setSearchTerm(
              `${initialData.associatedContactId.firstName} ${
                initialData.associatedContactId.lastName || ""
              }`
            );
          }
        }
      }

      setFormData({
        name: initialData.title || "",
        value: initialData.amount?.toString() || "",
        stage: initialData.status?._id || initialStage,
        expectedCloseDate: initialData.closingDate
          ? format(new Date(initialData.closingDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        contact: contactData,
        fields: dealFields,
      });

      // Cargar productos si existen
      if (initialData.dealProducts && Array.isArray(initialData.dealProducts)) {
        const mappedProducts = initialData.dealProducts.map((product: any) => ({
          productId: product.productId?._id || product.productId,
          productName: product.productId?.name || "Producto",
          variantId: product.variantId?._id || product.variantId,
          quantity: product.quantity?.toString() || "1",
          priceAtAcquisition:
            product.variantId?.attributeValues?.[0]?.price?.toString() || "0",
        }));
        setProducts(mappedProducts);
      }
    } else {
      // Si no es modo edición, resetear estado
      setIsEditMode(false);
      // Resetear formulario cuando se abre el modal para crear
      if (isOpen && !initialData) {
        setFormData({
          name: "",
          value: "",
          stage: initialStage,
          expectedCloseDate: format(new Date(), "yyyy-MM-dd"),
          contact: { id: "", name: "", email: "", phone: "" },
          fields: {} as Record<string, string>,
        });
        setSearchTerm("");
        setProducts([]);
        setAdditionalFields([]);
      }
    }
  }, [initialData, isOpen, initialStage]);

  useEffect(() => {
    const searchContacts = async () => {
      // No ejecutar la búsqueda si estamos en modo edición y el usuario no ha cambiado el searchTerm manualmente
      if (isEditMode && !showContactResults) {
        return;
      }

      if (!searchTerm) {
        setContacts([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await contactsService.searchContacts(searchTerm);
        setContacts(response.data.map(normalizeContact));
      } catch (error) {
        console.error("Error searching contacts:", error);
        setSearchTerm("");
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchContacts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, isEditMode, showContactResults]);

  const handleSubmit = (e: React.FormEvent) => {
    try {
      e.preventDefault();

      // Transformar los fields de objeto a array con la estructura requerida
      const formattedFields = Object.entries(formData.fields)
        .map(([key, value]) => {
          const field = customFields.find((f) => f.key === key);
          return {
            field: field?._id, // usa el ObjectId real
            value: value,
          };
        })
        .filter((f) => f.field);

      // Agregar los campos personalizados adicionales
      const additionalFormattedFields = additionalFields.map(
        ({ fieldId, value }) => ({
          field: fieldId,
          value: value,
        })
      );

      // Formatear los productos al formato esperado por la API
      const formattedProducts = products.map((product) => ({
        id: product.productId,
        variantId: product.variantId,
        quantity: parseInt(product.quantity.toString()) || 1,
        priceAtAcquisition:
          parseFloat(product.priceAtAcquisition.toString()) || 0,
      }));

      // Crear una copia del formData con fields transformado
      const formDataToSubmit = {
        ...formData,
        fields: [...formattedFields, ...additionalFormattedFields],
        products: formattedProducts,
      };
      console.log(formDataToSubmit);
      onSubmit(formDataToSubmit);

      // Limpiar formulario después del submit
      setProducts([]);
      setAdditionalFields([]);
      setFormData({
        name: "",
        value: "",
        stage: initialStage,
        expectedCloseDate: format(new Date(), "yyyy-MM-dd"),
        contact: { id: "", name: "", email: "", phone: "" },
        fields: {} as Record<string, string>,
      });
      setShowContactResults(false);
      setSearchTerm("");

      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setFormData({
      ...formData,
      contact: {
        id: contact._id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email || "",
        phone: contact.phone || "",
      },
    });
    setSearchTerm(`${contact.firstName} ${contact.lastName}`);
    setShowContactResults(false);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: value,
      },
    }));
  };

  const handleAddProduct = async (product: any) => {
    // Si el producto tiene variante, obtener su nombre inmediatamente
    if (product.variantId) {
      await getVariantName(product.productId, product.variantId);
    }

    setProducts((prev) => [...prev, product]);
    setIsProductModalOpen(false);
  };

  const renderCustomField = (field: DealField) => {
    const value = formData.fields[field.key] || "";

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
            placeholder={`Enter ${field.name.toLowerCase()}`}
            required={field.required}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
            placeholder={`Enter ${field.name.toLowerCase()}`}
            required={field.required}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
            required={field.required}
          >
            <option value="">Select {field.name.toLowerCase()}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.productId !== productId));
  };

  const handleAddAdditionalField = () => {
    // Añade un campo vacío al estado
    if (customFields.length > 0) {
      setAdditionalFields([
        ...additionalFields,
        { fieldId: customFields[0]._id, value: "" },
      ]);
    }
  };

  const handleRemoveAdditionalField = (index: number) => {
    const updatedFields = [...additionalFields];
    updatedFields.splice(index, 1);
    setAdditionalFields(updatedFields);
  };

  const handleAdditionalFieldChange = (
    index: number,
    fieldId: string,
    value: string
  ) => {
    const updatedFields = [...additionalFields];
    updatedFields[index] = { fieldId, value };
    setAdditionalFields(updatedFields);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar negocio" : "Nuevo negocio"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <label className="block text-sm font-medium text-gray-700">
              Buscar contacto *
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowContactResults(true);
                // Si el usuario está cambiando el texto manualmente, ya no estamos en la selección inicial
                if (isEditMode && e.target.value !== searchTerm) {
                  setIsEditMode(false);
                }
              }}
              className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent"
              placeholder="Buscar por nombre o email..."
              readOnly={false} // Permitir siempre editar para mejor UX
            />
            {showContactResults &&
              (searchTerm || isSearching) &&
              !isEditMode && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border overflow-hidden">
                  {isSearching ? (
                    <div className="p-3 text-center text-gray-500">
                      Buscando...
                    </div>
                  ) : contacts.length > 0 ? (
                    <ul className="max-h-60 overflow-auto divide-y divide-gray-100">
                      {contacts.map((contact) => (
                        <li
                          key={contact._id}
                          className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleSelectContact(contact)}
                        >
                          <div className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.email && (
                            <div className="text-sm text-gray-500">
                              {contact.email}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : searchTerm ? (
                    <div className="p-3 text-center text-gray-500">
                      No se encontraron contactos
                    </div>
                  ) : null}
                </div>
              )}
          </div>
        </div>

        {/* Deal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              <label className="block text-sm font-medium text-gray-700">
                Nombre del negocio *
              </label>
            </div>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
              placeholder="Ej: Proyecto de consultoría"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-gray-400" />
              <label className="block text-sm font-medium text-gray-700">
                Valor *
              </label>
            </div>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                required
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="block w-full pl-7 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <label className="block text-sm font-medium text-gray-700">
                Fecha estimada de cierre
              </label>
            </div>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expectedCloseDate: e.target.value,
                  })
                }
                className="block w-full pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              <label className="block text-sm font-medium text-gray-700">
                Etapa *
              </label>
            </div>
            <select
              value={formData.stage}
              onChange={(e) =>
                setFormData({ ...formData, stage: e.target.value })
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
            >
              <option value="">-Seleccionar etapa-</option>
              {stages.map((stage) => (
                <option key={stage._id} value={stage._id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customFields.map((field) => {
              if (field.required) {
                return (
                  <div key={field._id}>
                    <label className="block text-sm font-medium text-gray-700">
                      {field.name}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {renderCustomField(field)}
                  </div>
                );
              }
            })}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gray-400" />
            <label className="block text-sm font-medium text-gray-700">
              Productos
            </label>
          </div>

          {products.length > 0 && (
            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 items-center p-3 rounded-lg bg-gray-50 group hover:bg-gray-100 transition-colors"
                >
                  <div className="border-l-4 border-l-red-300 pl-2 col-span-5">
                    <p className="text-sm font-medium text-gray-700">
                      {product.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Precio: ${product.priceAtAcquisition}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cantidad: {product.quantity}
                    </p>
                    {product.variantId && (
                      <p className="text-sm text-gray-500">
                        Variante:{" "}
                        {variantNames[product.variantId] || product.variantId}
                      </p>
                    )}
                    {console.log(product) as any}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.productId)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-full transition-all"
                    >
                      <X
                        size={16}
                        className="text-gray-400 hover:text-red-500"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsProductModalOpen(true)}
            className="w-full rounded-lg border-2 border-dashed border-gray-200 p-3 text-sm text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Agregar producto
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-gray-400" />
            <label className="block text-sm font-medium text-gray-700">
              Campos personalizados
            </label>
          </div>

          {additionalFields.map((field, index) => (
            <div key={index} className="grid grid-cols-10 gap-2 items-center">
              <div className="col-span-4">
                <select
                  value={field.fieldId}
                  onChange={(e) =>
                    handleAdditionalFieldChange(
                      index,
                      e.target.value,
                      field.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                >
                  {customFields.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) =>
                    handleAdditionalFieldChange(
                      index,
                      field.fieldId,
                      e.target.value
                    )
                  }
                  placeholder="Valor del campo"
                  className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent px-3 py-2"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalField(index)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <Minus
                    size={16}
                    className="text-gray-400 hover:text-red-500"
                  />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddAdditionalField}
            className="w-full rounded-lg border-2 border-dashed border-gray-200 p-3 text-sm text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Agregar campo personalizado
          </button>
        </div>

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSelect={handleAddProduct}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!formData.name || !formData.value || !formData.contact.id}
          >
            {initialData ? (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Guardar cambios
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Crear negocio
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
