import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import type { Quote, QuoteItem } from "../types/quote";
import type { Contact } from "../types/contact";
import { useAuth } from "../contexts/AuthContext";
import quotesService from "../services/quotesService";
import { useToast } from "../components/ui/toast";
import { CustomerInfo } from "../components/invoices/CustomerInfo";
import { InvoiceDates } from "../components/invoices/InvoiceDates";
import { InvoiceSummary } from "../components/invoices/InvoiceSummary";
import { ContactSelectionModal } from "../components/invoices/ContactSelectionModal";
import { QuoteItems } from "../components/quotes/QuoteItems";
import { QuotesNotes } from "../components/quotes/QuotesNotes";
import { useLoading } from "../contexts/LoadingContext";
import { QuoteHeader } from "../components/quotes/QuoteHeader";
import { normalizeContact } from "../lib/parseContacts";

export function QuoteEditor() {
  const { organization, refreshOrganization } = useAuth();
  const navigate = useNavigate();

  // Verificar si las configuraciones de cotizaciones están disponibles
  const hasQuotationSettings = organization?.settings?.quotations;

  // Validaciones defensivas para usuarios nuevos
  const quotationSettings = hasQuotationSettings
    ? organization.settings.quotations
    : {
        quotationNumber: "COT-001",
        notes: "",
        paymentTerms: ["Contado"],
        shippingTerms: ["FOB"],
      };

  // Si no hay configuraciones, mostrar mensaje de configuración requerida
  if (!hasQuotationSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Configuración Requerida
            </h2>
            <p className="text-gray-600 mb-6">
              Para crear cotizaciones necesitas configurar primero los ajustes
              de cotización como numeración, términos de pago y envío.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/quotes")}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button onClick={() => navigate("/settings")} className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [quote, setQuote] = useState<Quote>({
    quotationNumber: quotationSettings.quotationNumber || "COT-001",
    expirationDate: format(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    name: "",
    status: "draft",
    contact: {
      firstName: "",
      lastName: "",
      email: "",
      _id: "",
      taxId: "",
      createdAt: "",
      updatedAt: "",
    },
    items: [],
    subtotal: 0,
    discount: 0,
    taxes: 0,
    total: 0,
    observaciones: quotationSettings.notes || "",
    paymentTerms: quotationSettings.paymentTerms?.[0] || "Contado",
    shippingTerms: quotationSettings.shippingTerms?.[0] || "FOB",
    creationDate: format(new Date(), "yyyy-MM-dd"),
    lastModified: format(new Date(), "yyyy-MM-dd"),
    optionalItems: [],
    userId: "",
  });

  const { showLoading, hideLoading } = useLoading();
  const [showContactModal, setShowContactModal] = useState(false);
  const id = useParams().id;
  const toast = useToast();

  const getQuote = async () => {
    if (id) {
      try {
        showLoading("Cargando cotización...");
        const response = await quotesService.getQuoteById(id);
        const quoteData = response.data;

        // Mapear la información del cliente correctamente
        let contactInfo = null;

        // Primero intentar con contact
        if (
          quoteData.contact &&
          (quoteData.contact.firstName || (quoteData.contact as any).name)
        ) {
          contactInfo = {
            firstName:
              quoteData.contact.firstName ||
              (quoteData.contact as any).name ||
              "",
            lastName: quoteData.contact.lastName || "",
            email: quoteData.contact.email || "",
            mobile: quoteData.contact.mobile || "",
            phone: quoteData.contact.phone || "",
            companyName: quoteData.contact.companyName || "",
            taxId: quoteData.contact.taxId || "",
            _id: quoteData.contact._id || (quoteData.contact as any).id || "",
            createdAt: quoteData.contact.createdAt || "",
            updatedAt: quoteData.contact.updatedAt || "",
            idType: quoteData.contact.idType || "",
            idNumber: quoteData.contact.idNumber || "",
            address: quoteData.contact.address || {
              street: "",
              city: "",
              state: "",
              country: "",
              zipCode: "",
            },
          };
        }
        // Si contact está vacío, intentar con contactId (menos restrictivo)
        else if (
          quoteData.contactId &&
          typeof quoteData.contactId === "object"
        ) {
          const contactData = quoteData.contactId as any;

          // Si hay properties, usar la función normalizeContact que ya existe
          if (contactData.properties && Array.isArray(contactData.properties)) {
            try {
              const normalizedContact = normalizeContact(contactData);

              contactInfo = {
                firstName: normalizedContact.firstName || "",
                lastName: normalizedContact.lastName || "",
                email: normalizedContact.email || "",
                mobile: normalizedContact.mobile || "",
                phone: normalizedContact.phone || "",
                companyName: normalizedContact.companyName || "",
                taxId: normalizedContact.taxId || "",
                _id: normalizedContact._id || "",
                createdAt: normalizedContact.createdAt || "",
                updatedAt: normalizedContact.updatedAt || "",
                idType: normalizedContact.idType || "",
                idNumber: normalizedContact.idNumber || "",
                address: normalizedContact.address || {
                  street: "",
                  city: "",
                  state: "",
                  country: "",
                  zipCode: "",
                },
              };
            } catch (error) {
              console.error("Error normalizing contact:", error);
              // Fallback manual si normalizeContact falla
              const clientData: any = {};
              contactData.properties.forEach((prop: any) => {
                if (prop.key && prop.value) {
                  clientData[prop.key] = prop.value;
                }
              });

              contactInfo = {
                firstName: clientData.firstName || "",
                lastName: clientData.lastName || "",
                email: clientData.email || "",
                mobile: clientData.mobile || "",
                phone: clientData.phone || "",
                companyName: clientData.companyName || "",
                taxId: clientData.idNumber || "",
                _id: contactData._id || "",
                createdAt: contactData.createdAt || "",
                updatedAt: contactData.updatedAt || "",
                idType: clientData.idType || "",
                idNumber: clientData.idNumber || "",
                address: {
                  street: clientData.address || "",
                  city: clientData.city || "",
                  state: clientData.state || "",
                  country: clientData.country || "",
                  zipCode: clientData.postalCode || "",
                },
              };
            }
          } else {
            // Fallback a los campos directos si no hay properties
            contactInfo = {
              firstName: contactData.firstName || contactData.name || "",
              lastName: contactData.lastName || "",
              email: contactData.email || "",
              mobile: contactData.mobile || "",
              phone: contactData.phone || "",
              companyName: contactData.companyName || "",
              taxId: contactData.taxId || "",
              _id: contactData._id || contactData.id || "",
              createdAt: contactData.createdAt || "",
              updatedAt: contactData.updatedAt || "",
              idType: contactData.idType || "",
              idNumber: contactData.idNumber || "",
              address: contactData.address || {
                street: "",
                city: "",
                state: "",
                country: "",
                zipCode: "",
              },
            };
          }
        }
        // Si ninguno tiene información, buscar en otros campos posibles
        else {
          // Buscar en campos alternativos
          const possibleContactFields = [
            "customer",
            "client",
            "clientId",
            "customerId",
          ];
          for (const field of possibleContactFields) {
            if ((quoteData as any)[field]) {
              const fieldData = (quoteData as any)[field];
              contactInfo = {
                firstName: fieldData.firstName || fieldData.name || "",
                lastName: fieldData.lastName || "",
                email: fieldData.email || "",
                mobile: fieldData.mobile || "",
                phone: fieldData.phone || "",
                companyName: fieldData.companyName || "",
                taxId: fieldData.taxId || "",
                _id: fieldData._id || fieldData.id || "",
                createdAt: fieldData.createdAt || "",
                updatedAt: fieldData.updatedAt || "",
                idType: fieldData.idType || "",
                idNumber: fieldData.idNumber || "",
                address: fieldData.address || {
                  street: "",
                  city: "",
                  state: "",
                  country: "",
                  zipCode: "",
                },
              };
              break;
            }
          }
        }

        setQuote({
          ...quoteData,
          contact: contactInfo || {
            firstName: "",
            lastName: "",
            email: "",
            _id: "",
            taxId: "",
            createdAt: "",
            updatedAt: "",
          },
        });
      } catch (error) {
        console.error("Error loading quote:", error);
        toast.show({
          title: "Error",
          description: "No se pudo cargar la cotización",
          type: "error",
        });
      } finally {
        hideLoading();
      }
    }
  };

  useEffect(() => {
    getQuote();
  }, [id]);

  useEffect(() => {
    const currentQuotationNumber =
      organization?.settings?.quotations?.quotationNumber;
    if (currentQuotationNumber) {
      setQuote((prev) => ({
        ...prev,
        quotationNumber: currentQuotationNumber,
      }));
    }
  }, [organization?.settings?.quotations?.quotationNumber]);

  const handleSelectContact = (contact: Contact) => {
    setQuote((prev) => {
      const updatedQuote = {
        ...prev,
        contact: {
          ...(prev.contact || {}),
          firstName: contact.firstName || "",
          lastName: contact.lastName || "",
          email: contact.email || "",
          mobile: contact.mobile || "",
          companyName: contact.companyName || "",
          taxId: contact.taxId || "",
          _id: contact._id,
          createdAt: contact.createdAt || "",
          updatedAt: contact.updatedAt || "",
          idType: contact.idType || "",
          phone: contact.phone || "",
          address: contact.address || {
            street: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
          },
        },
      };

      return updatedQuote;
    });
  };

  const calculateTotals = (updatedItems: QuoteItem[]) => {
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const totalDiscount = updatedItems.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );

    const totalTax = updatedItems.reduce((sum, item) => {
      const itemSubtotal =
        item.quantity * item.unitPrice - (item.discount || 0);
      const tax = item.taxes ? (itemSubtotal * item.taxes) / 100 : 0;
      return sum + Math.round(tax);
    }, 0);

    const total = Math.round(subtotal - totalDiscount + totalTax);

    setQuote((prev) => ({
      ...prev,
      items: updatedItems.map((item) => ({
        ...item,
        total: Math.round(item.total),
      })),
      subtotal: Math.round(subtotal),
      discount: Math.round(totalDiscount),
      taxes: totalTax,
      total,
    }));
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item_${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxes: 0,
      total: 0,
      name: "",
      imageUrl: "",
    };
    const updatedItems = [...(quote.items || []), newItem];
    calculateTotals(updatedItems);
  };

  const handleUpdateItemField = (
    index: number,
    field: string | number | symbol,
    value: string | number
  ) => {
    const updatedItems = [...(quote.items || [])];
    const item = { ...updatedItems[index], [field]: value };

    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const discount = Number(item.discount || 0);
    const taxRate = Number(item.taxes); // este es el porcentaje

    const subtotal = quantity * unitPrice;
    const taxValue = Math.round(((subtotal - discount) * taxRate) / 100);
    item.total = Math.round(subtotal - discount + taxValue);

    updatedItems[index] = item;
    calculateTotals(updatedItems);
  };

  const handleReplaceItem = (index: number, newItem: QuoteItem) => {
    const updatedItems = [...(quote.items || [])];
    updatedItems[index] = newItem;
    calculateTotals(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = (quote.items || []).filter((_, i) => i !== index);
    calculateTotals(updatedItems);
  };

  const handleSave = async () => {
    try {
      const { contact } = quote;

      if (!contact || !contact.firstName) {
        toast.show({
          title: "Error",
          description:
            "Por favor selecciona un cliente válido con nombre, correo y empresa.",
          type: "error",
        });
        return;
      }

      const baseQuoteData = {
        ...quote,
        items: (quote.items || []).map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          taxes: Number(item.taxes),
          total: Number(item.total),
          imageUrl: item.imageUrl || "",
        })),
        subtotal: Number(quote.subtotal),
        discounts: Number(quote.discount),
        taxes: Number(quote.taxes),
        total: Number(quote.total),
        lastModified: format(new Date(), "yyyy-MM-dd"),
        name: `${quotationSettings.quotationNumber || "COT-001"} - ${
          quote.contact.firstName
        }`,
        paymentTerms: quotationSettings.paymentTerms?.[0] || "Contado",
        shippingTerms: quotationSettings.shippingTerms?.[0] || "FOB",
        notes: quotationSettings.notes || "",
        observaciones: quotationSettings.notes || "",
      };

      let quoteData;

      if (id) {
        // Para actualizar: enviar contactId directamente
        quoteData = {
          ...baseQuoteData,
          contactId: contact._id,
        };
      } else {
        // Para crear: enviar contact.id como espera el backend
        quoteData = {
          ...baseQuoteData,
          contact: {
            id: contact._id,
          },
        };
      }

      if (id) {
        await quotesService.updateQuote(id as string, quoteData as any);
        toast.show({
          title: "Actualizada",
          description: "Cotización actualizada correctamente",
          type: "success",
        });
      } else {
        await quotesService.createQuote(quoteData as any);
        toast.show({
          title: "Creada",
          description: "Cotización creada correctamente",
          type: "success",
        });

        // Refrescar la organización para obtener el nuevo número de cotización
        await refreshOrganization();
      }

      navigate("/quotes");
    } catch (error: any) {
      console.error("Error saving quote:", error);
      toast.show({
        title: "Error",
        description: error.message || "Error al guardar la cotización",
        type: "error",
      });
    } finally {
      hideLoading();
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/quotes")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {id ? "Editar Cotización" : "Nueva Cotización"}
              </h1>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <QuoteHeader
              organization={organization}
              quoteNumber={quote.quotationNumber}
              date={quote.creationDate!}
              dueDate={quote.expirationDate!}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <QuoteItems
                  items={quote.items || []}
                  onAddItem={handleAddItem}
                  onUpdateItemField={handleUpdateItemField}
                  onReplaceItem={handleReplaceItem}
                  onRemoveItem={handleRemoveItem}
                />

                <QuotesNotes
                  observaciones={quote.observaciones}
                  terms={quote.paymentTerms[0]}
                  shippingTerms={quote.shippingTerms}
                  onNotesChange={(observaciones) =>
                    setQuote((prev) => ({ ...prev, observaciones }))
                  }
                  onPaymentTermsChange={(paymentTerms) =>
                    setQuote((prev) => ({ ...prev, paymentTerms }))
                  }
                  onShippingTermsChange={(shippingTerms) =>
                    setQuote((prev) => ({ ...prev, shippingTerms }))
                  }
                />
              </div>

              <div className="space-y-6">
                <CustomerInfo
                  customer={{
                    firstName: quote.contact?.firstName || "",
                    lastName: quote.contact?.lastName || "",
                    email: quote.contact?.email || "",
                    taxId: quote.contact?.taxId || "",
                    _id: quote.contact?._id || "",
                    createdAt: quote.contact?.createdAt || "",
                    updatedAt: quote.contact?.updatedAt || "",
                    phone: quote.contact?.phone || "",
                    mobile: quote.contact?.mobile || "",
                    companyName: quote.contact?.companyName || "",
                    idType: quote.contact?.idType || "",
                    idNumber: quote.contact?.idNumber || "",
                  }}
                  onChangeCustomer={() => setShowContactModal(true)}
                />

                <InvoiceDates
                  date={quote.creationDate!}
                  dueDate={quote.expirationDate!}
                  onDateChange={(creationDate) =>
                    setQuote((prev) => ({ ...prev, creationDate }))
                  }
                  onDueDateChange={(expirationDate) =>
                    setQuote((prev) => ({ ...prev, expirationDate }))
                  }
                />

                <InvoiceSummary
                  subtotal={quote.subtotal!}
                  discount={quote.discount!}
                  tax={quote.taxes!}
                  total={quote.total!}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/quotes")}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Crear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactSelectionModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSelect={handleSelectContact}
      />
    </div>
  );
}
