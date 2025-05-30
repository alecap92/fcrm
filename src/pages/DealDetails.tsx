import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Tag as TagIcon,
  FileText,
  Box,
  User,
  BarChart3,
  PlusCircle,
  CheckCircle2,
  Timer,
  Edit2,
  ArrowLeft,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import type { Deal } from "../types/deal";
import { contactsService } from "../services/contactsService";
import { normalizeContact } from "../lib/parseContacts";
import { useToast } from "../components/ui/toast";
import { useLoading } from "../contexts/LoadingContext";
import { CreateDealModal } from "../components/deals/CreateDealModal";
import { useDeals } from "../contexts/DealsContext";

const DealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { showLoading, hideLoading } = useLoading();

  // Usar el contexto de deals
  const {
    currentDeal,
    relatedDeals,
    setCurrentDeal,
    setRelatedDeals,
    fetchDealById,
    fetchRelatedDeals,
    updateDealById,
  } = useDeals();

  const [contact, setContact] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDeal = async () => {
    if (!id) return;

    try {
      showLoading("Cargando detalles del negocio...");
      const dealData = await fetchDealById(id);
      setCurrentDeal(dealData);
    } catch (error) {
      console.error("Error fetching deal:", error);
      toast.show({
        title: "Error",
        description: "Error al cargar los detalles del negocio",
        type: "error",
      });
    } finally {
      hideLoading();
    }
  };

  const fetchContactAndRelatedDeals = async (contactId: string) => {
    try {
      // Obtener detalles del contacto
      const contactResponse = await contactsService.getContactById(contactId);
      const normalizedContact = normalizeContact(contactResponse.data.contact);
      setContact(normalizedContact);

      // Obtener negocios relacionados usando el contexto
      const relatedDealsData = await fetchRelatedDeals(contactId, id);
      setRelatedDeals(relatedDealsData);
    } catch (error) {
      console.error("Error fetching contact and related deals:", error);
    }
  };

  const handleEditDeal = async (updatedDeal: any) => {
    if (!id) {
      toast.show({
        title: "Error",
        description: "ID del negocio no encontrado",
        type: "error",
      });
      return;
    }

    try {
      showLoading("Actualizando negocio...");

      const dealData = {
        title: updatedDeal.name,
        amount: parseFloat(updatedDeal.value),
        closingDate: updatedDeal.expectedCloseDate,
        status: updatedDeal.stage,
        associatedContactId: updatedDeal.contact.id,
        fields: updatedDeal.fields,
        dealProducts: updatedDeal.products || [],
      };

      await updateDealById(id, dealData);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating deal:", error);
    } finally {
      hideLoading();
    }
  };

  const handleContactRedirect = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const handleDealRedirect = (dealId: string) => {
    navigate(`/deals/${dealId}`);
  };

  useEffect(() => {
    fetchDeal();
  }, [id]);

  useEffect(() => {
    if (currentDeal?.associatedContactId) {
      const contactId =
        typeof currentDeal.associatedContactId === "string"
          ? currentDeal.associatedContactId
          : currentDeal.associatedContactId._id;
      fetchContactAndRelatedDeals(contactId);
    }
  }, [currentDeal]);

  if (!currentDeal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Cargando detalles del negocio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentDeal.title}
                </h1>
                {contact && (
                  <p
                    className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                    onClick={() => handleContactRedirect(contact._id)}
                  >
                    {contact.firstName} {contact.lastName}
                  </p>
                )}
                <p className="text-gray-500">{contact?.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit2 className="h-5 w-5" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valor del Negocio</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentDeal.amount?.toLocaleString() || "0"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentDeal.status?.name || "Sin estado"}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Fecha de Cierre</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentDeal.closingDate
                    ? format(new Date(currentDeal.closingDate), "dd/MM/yyyy")
                    : "No definido"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Creado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentDeal.createdAt
                    ? format(new Date(currentDeal.createdAt), "dd/MM/yyyy")
                    : "No definido"}
                </p>
              </div>
              <Clock className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Deal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Información del Negocio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Título</p>
                    <p className="text-gray-700">{currentDeal.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Valor</p>
                    <p className="text-gray-700">
                      ${currentDeal.amount?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Fecha de Cierre Esperada
                    </p>
                    <p className="text-gray-700">
                      {currentDeal.closingDate
                        ? format(
                            new Date(currentDeal.closingDate),
                            "dd/MM/yyyy"
                          )
                        : "No definido"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className="text-gray-700">
                      {currentDeal.status?.name || "Sin estado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {contact && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Información del Contacto
                  </h2>
                  <button
                    onClick={() => handleContactRedirect(contact._id)}
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    Ver detalles
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="text-gray-700">
                        {contact.firstName} {contact.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Empresa</p>
                      <p className="text-gray-700">
                        {contact.companyName || "No disponible"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-700">
                        {contact.email || "No disponible"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-gray-700">
                        {contact.phone || contact.mobile || "No disponible"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Productos</h2>
              <div className="space-y-3">
                {currentDeal?.dealProducts?.length > 0 ? (
                  currentDeal.dealProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all border"
                    >
                      <Box className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-md" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {product.productId?.name || "Producto"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Variante:{" "}
                            {product.variantId
                              ? product?.variantId?.attributeValues?.[0]
                                  ?.value || "Sin especificar"
                              : "Sin Variante"}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Cantidad: {product.quantity}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Precio: $
                            {product.priceAtAcquisition ||
                              product.variantId?.attributeValues?.[0]?.price ||
                              "Sin Precio"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hay productos asociados a este negocio
                  </p>
                )}
              </div>
            </div>

            {/* Custom Fields */}
            {currentDeal.fields &&
              Array.isArray(currentDeal.fields) &&
              currentDeal.fields.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Campos Personalizados
                  </h2>
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
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Deals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Otros Negocios del Contacto
              </h2>
              <div className="space-y-3">
                {relatedDeals.length > 0 ? (
                  relatedDeals.map((relatedDeal) => (
                    <div
                      key={relatedDeal._id}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        relatedDeal._id && handleDealRedirect(relatedDeal._id)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-blue-500 hover:text-blue-700">
                            {relatedDeal.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {relatedDeal.status?.name || "Sin estado"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {relatedDeal.closingDate
                              ? format(
                                  new Date(relatedDeal.closingDate),
                                  "dd/MM/yyyy"
                                )
                              : "Sin fecha"}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-500">
                            {relatedDeal.amount?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No hay otros negocios para este contacto
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                {contact && (
                  <button
                    onClick={() => handleContactRedirect(contact._id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Ver perfil del contacto
                  </button>
                )}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-2 text-gray-400" />
                  Editar negocio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Deal Modal */}
      {showEditModal && (
        <CreateDealModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditDeal}
          initialData={currentDeal}
        />
      )}
    </div>
  );
};

export default DealDetails;
