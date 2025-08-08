import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Tag as TagIcon,
  MessageSquare,
  FileText,
  Link,
  BarChart,
  ChevronRight,
  Edit2,
  Box,
} from "lucide-react";
import { Button } from "../ui/button";
import { format } from "date-fns";
import type { Deal } from "../../types/deal";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { normalizeContact } from "../../lib/parseContacts";
import { dealsService } from "../../services/dealsService";
import { contactsService } from "../../services/contactsService";
import type { Contact } from "../../types/contact";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface DealDetailsModalProps {
  deal?: Deal | any;
  onClose: () => void;
  onEdit: () => void;
  dealId?: string;
}

export function DealDetailsModal({
  deal,
  onClose,
  onEdit,
  dealId,
}: DealDetailsModalProps) {
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [hasFetchedDealProducts, setHasFetchedDealProducts] = useState(false);

  const fetchContactData = async (contactId: string) => {
    try {
      setIsLoadingContact(true);
      const response = await contactsService.getContactById(contactId);
      console.log("📞 Datos del contacto obtenidos:", response.data);

      if (response.data?.contact) {
        const contactData = response.data.contact;
        const properties = contactData.properties || [];

        // Función auxiliar para obtener el valor de una propiedad
        const getPropertyValue = (key: string) => {
          const prop = properties.find((p: any) => p.key === key);
          return prop ? prop.value : "";
        };

        setContact({
          _id: contactData._id,
          firstName: getPropertyValue("firstName"),
          lastName: getPropertyValue("lastName"),
          email: getPropertyValue("email"),
          phone: getPropertyValue("phone"),
          mobile: getPropertyValue("mobile"),
          companyName: getPropertyValue("companyName"),
          createdAt: contactData.createdAt,
          updatedAt: contactData.updatedAt,
          taxId: getPropertyValue("taxId") || "",
          // Campos adicionales que vemos en la UI
          idType: getPropertyValue("idType"),
          idNumber: getPropertyValue("idNumber"),
          companyType: getPropertyValue("companyType"),
          lifeCycle: getPropertyValue("lifeCycle"),
        });
      }
    } catch (error) {
      console.error("❌ Error al obtener datos del contacto:", error);
      setContact(null);
    } finally {
      setIsLoadingContact(false);
    }
  };

  const parseContactInfo = () => {
    if (currentDeal?.associatedContactId) {
      console.log("🔍 Deal completo:", currentDeal);
      console.log("🔍 Contact ID:", currentDeal.associatedContactId);

      // Si associatedContactId es un string (ID), buscar los datos del contacto
      if (typeof currentDeal.associatedContactId === "string") {
        fetchContactData(currentDeal.associatedContactId);
      } else {
        // Si ya tenemos los datos del contacto, asegurarnos de que tenga el formato correcto
        const contactData = currentDeal.associatedContactId as {
          _id: string;
          properties: any[];
          createdAt?: string;
          updatedAt?: string;
        };
        if (contactData && contactData.properties) {
          const getPropertyValue = (key: string) => {
            const prop = contactData.properties.find((p: any) => p.key === key);
            return prop ? prop.value : "";
          };

          setContact({
            _id: contactData._id,
            firstName: getPropertyValue("firstName"),
            lastName: getPropertyValue("lastName"),
            email: getPropertyValue("email"),
            phone: getPropertyValue("phone"),
            mobile: getPropertyValue("mobile"),
            companyName: getPropertyValue("companyName"),
            createdAt: contactData.createdAt || new Date().toISOString(),
            updatedAt: contactData.updatedAt || new Date().toISOString(),
            taxId: getPropertyValue("taxId") || "",
            // Campos adicionales que vemos en la UI
            idType: getPropertyValue("idType"),
            idNumber: getPropertyValue("idNumber"),
            companyType: getPropertyValue("companyType"),
            lifeCycle: getPropertyValue("lifeCycle"),
          });
        } else {
          console.error("❌ Datos de contacto inválidos:", contactData);
          setContact(null);
        }
      }
    } else {
      console.log("⚠️ No hay ID de contacto disponible");
      setContact(null);
    }
  };

  const handleRedirect = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  // Obtiene el negocio por su ID (usa el prop dealId o uno proporcionado)
  const fetchDeal = async (id?: string) => {
    const targetId = id || dealId;

    if (!targetId) return;

    try {
      const response = await dealsService.getDealById(targetId);
      console.log("📦 Respuesta completa del servidor:", response);

      // Parsear la respuesta para unir deal y fields si es necesario
      if (response.data && response.data.deal) {
        // Si la respuesta tiene una estructura con deal y fields separados
        const dealData = {
          ...response.data.deal,
          fields: response.data.fields || [],
          dealProducts:
            response.data.deal.dealProducts || response.data.dealProducts || [],
        };
        console.log("🎯 Deal data procesada (estructura anidada):", dealData);
        console.log("🛍️ Productos en dealData:", dealData.dealProducts);
        setCurrentDeal(dealData);
      } else {
        // Si la respuesta ya tiene el formato esperado
        const dealData = {
          ...response.data,
          dealProducts: response.data.dealProducts || [],
        };
        console.log("🎯 Deal data procesada (formato plano):", dealData);
        console.log("🛍️ Productos en dealData:", dealData.dealProducts);
        setCurrentDeal(dealData);
      }
    } catch (error) {
      console.error("Error fetching deal:", error);
    }
  };

  // Función para obtener los productos del negocio de forma independiente
  const fetchDealProducts = async (dealIdParam: string) => {
    try {
      const response = await dealsService.getDealProducts(dealIdParam);
      if (response && Array.isArray(response.data)) {
        console.log("🛍️ Productos obtenidos por separado:", response.data);

        setCurrentDeal((prev) =>
          prev
            ? {
                ...prev,
                dealProducts: response.data,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("❌ Error al obtener productos del negocio:", error);
    }
  };

  useEffect(() => {
    // Verificar si deal es válido o si necesitamos obtenerlo
    const isDealValid =
      deal &&
      Object.keys(deal).length >= 0 &&
      !(Array.isArray(deal) && deal.length === 0);

    if (isDealValid) {
      console.log("🎯 Deal proporcionado directamente:", deal);
      console.log("🛍️ Productos en deal directo:", deal.dealProducts);
      setCurrentDeal(deal);

      // Si el negocio no tiene productos asociados, intentamos cargarlos
      if (
        !hasFetchedDealProducts &&
        (!deal.dealProducts || deal.dealProducts.length === 0) &&
        (deal._id || dealId)
      ) {
        console.log(
          "🔄 No se encontraron productos en el negocio proporcionado. Solicitando al servidor..."
        );
        fetchDealProducts(deal._id || (dealId as string));
        setHasFetchedDealProducts(true);
      }

      // Asegurar que los campos personalizados estén cargados
      if ((!deal.fields || deal.fields.length === 0) && (deal._id || dealId)) {
        console.log(
          "🔄 No se encontraron campos personalizados en el negocio proporcionado. Solicitando al servidor..."
        );
        fetchDeal(deal._id || (dealId as string));
      }
    } else if (dealId) {
      console.log("🔍 Buscando deal por ID:", dealId);
      fetchDeal();
    }
  }, [deal, dealId]);

  useEffect(() => {
    if (currentDeal) {
      console.log("🔄 Deal actualizado:", currentDeal);
      console.log("🛍️ Productos en currentDeal:", currentDeal.dealProducts);
      parseContactInfo();

      // Si después de actualizar todavía no hay productos y no hemos intentado, intentar cargar
      if (
        !hasFetchedDealProducts &&
        (!currentDeal.dealProducts || currentDeal.dealProducts.length === 0) &&
        (currentDeal._id || dealId)
      ) {
        console.log(
          "🔄 Intento adicional para obtener productos faltantes del negocio..."
        );
        fetchDealProducts(currentDeal._id || (dealId as string));
        setHasFetchedDealProducts(true);
      }
    }
  }, [currentDeal]);

  // Si no hay deal válido y todavía está cargando, mostrar loading
  if (!currentDeal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <p>Cargando detalles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDeal.title}
                </h2>
                {contact && contact.firstName && (
                  <p
                    className="text-sm text-blue-500 cursor-pointer"
                    onClick={() => contact._id && handleRedirect(contact._id)}
                  >
                    {contact.firstName} {contact.lastName}
                  </p>
                )}
                {contact && contact.companyName && (
                  <p className="text-sm text-gray-500">{contact.companyName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Custom Fields */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Campos Personalizados
                </h3>
                {currentDeal?.fields &&
                Array.isArray(currentDeal.fields) &&
                currentDeal.fields.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentDeal.fields.map((field: any) => (
                      <div
                        key={field._id || field.field?._id}
                        className="flex items-center space-x-3"
                      >
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">
                            {field.field?.name || "Campo personalizado"}
                          </p>
                          <p className="text-gray-700">
                            {field.value || "Sin valor"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No hay campos personalizados
                  </p>
                )}
              </div>

              {/* Products Section */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Productos
                </h3>
                <div className="space-y-3">
                  {(() => {
                    console.log(
                      "🎨 Renderizando productos:",
                      currentDeal?.dealProducts
                    );
                    return currentDeal?.dealProducts?.length > 0 ? (
                      currentDeal.dealProducts.map((product: any) => {
                        console.log("📦 Producto individual:", product);
                        return (
                          <div
                            key={product._id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all border"
                          >
                            <Box className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-md" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {product.productId?.name ||
                                  "Producto sin nombre"}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Variante:{" "}
                                  {product.variantId
                                    ? product.variantId.attributeValues?.[0]
                                        ?.value || "Sin valor"
                                    : "Sin Variante"}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Cantidad: {product.quantity || 0}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                  Precio: $
                                  {product.priceAtAcquisition ||
                                    (product.variantId &&
                                      product.variantId.attributeValues?.[0]
                                        ?.price) ||
                                    "Sin Precio"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No hay productos asociados a este negocio
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Deal Info */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Deal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Value
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ${currentDeal.amount?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Expected Close
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {currentDeal.closingDate
                        ? format(
                            new Date(currentDeal.closingDate),
                            "dd/MM/yyyy"
                          )
                        : "No definido"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Created
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {currentDeal.createdAt
                        ? format(new Date(currentDeal.createdAt), "dd/MM/yyyy")
                        : "No definido"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <TagIcon className="w-4 h-4 mr-2" />
                      Status
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {currentDeal.status?.name || "No definido"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {isLoadingContact ? (
                    <div className="text-sm text-gray-500">
                      Cargando información del contacto...
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center text-sm">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {contact?.companyName || "No disponible"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {contact?.email || "No disponible"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          {contact?.phone || contact?.mobile || "No disponible"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
