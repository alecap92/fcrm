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
  const [contact, setContact] = useState<any>([]);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);

  const handleRedirect = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const parseContactInfo = () => {
    if (currentDeal?.associatedContactId) {
      const parsedContact = [currentDeal.associatedContactId].map(normalizeContact);
      setContact(parsedContact[0]);
    }
  };

  const fetchDeal = async () => {
    if (dealId) { 
      try {

        const response = await dealsService.getDealById(dealId);
        
        // Parsear la respuesta para unir deal y fields si es necesario
        if (response.data && response.data.deal) {
          // Si la respuesta tiene una estructura con deal y fields separados
          const dealData = {
            ...response.data.deal,
            fields: response.data.fields || []
          };
          setCurrentDeal(dealData);
        } else {
          // Si la respuesta ya tiene el formato esperado
          setCurrentDeal(response.data);
        }
      } catch (error) {
        console.error("Error fetching deal:", error);
      }
    }
  };

  useEffect(() => {
    // Verificar si deal es válido o si necesitamos obtenerlo
    const isDealValid = deal && Object.keys(deal).length >= 0 && !(Array.isArray(deal) && deal.length === 0);
    
    if (isDealValid) {
      setCurrentDeal(deal);
    } else if (dealId) {
      fetchDeal();
    }
  }, [deal, dealId]);

  useEffect(() => {
    if (currentDeal) {
      parseContactInfo();
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
                <p
                  className="text-sm text-blue-500 cursor-pointer"
                  onClick={() => contact?._id && handleRedirect(contact._id)}
                >
                  {contact?.firstName}
                </p>
                <p className="text-sm text-gray-500">{contact?.companyName}</p>
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

             

             

              {/* Files */}
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Productos</h3>
                 
                </div>
                <div className="space-y-2">
                    {
                      currentDeal?.dealProducts?.map((product) => {
                        return (
                          <div key={product._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                             <Box className="w-5 h-5 text-gray-400" />
                             <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.productId.name} - {product.variantId.attributeValues[0].value}
                              </p>
                              <p className="text-xs text-gray-500">
                                Cantidad: {product.quantity}
                              </p>  
                              <p className="text-xs text-gray-500">
                                ${product.variantId.attributeValues[0].price}
                              </p>
                             </div>
                          </div>
                        )
                      })
                    }
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
                      ${currentDeal.amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Expected Close
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {currentDeal.closingDate ? format(new Date(currentDeal.closingDate), "dd/MM/yyyy") : 'No definido'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Created
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {currentDeal.createdAt ? format(new Date(currentDeal.createdAt), "dd/MM/yyyy") : 'No definido'}
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
                  <div className="flex items-center text-sm">
                    <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {currentDeal.associatedContactId?.properties?.companyName || contact?.companyName || 'No disponible'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {currentDeal.associatedContactId?.properties?.email || contact?.email || 'No disponible'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {currentDeal.associatedContactId?.properties?.phone || contact?.mobile || 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Fields */}
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Custom Fields
                </h3>
                <div className="space-y-3">
                  {currentDeal.fields && Array.isArray(currentDeal.fields) && currentDeal.fields.length > 0 ? (
                    currentDeal.fields.map((field: any) => (
                      <div
                        key={field._id || field.field?._id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-500">
                          {field.field?.name || 'Campo personalizado'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {field.value || ''}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hay campos personalizados</p>
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
