import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
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

export function QuoteEditor() {
  const { organization } = useAuth();
  console.log("organization", organization.settings.quotations.quotationNumber);
  const [quote, setQuote] = useState<Quote>({
    quotationNumber: organization.settings.quotations.quotationNumber,
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
      id: "",
      taxId: "",
      createdAt: "",
      updatedAt: "",
    },
    items: [],
    subtotal: 0,
    discount: 0,
    taxes: 0,
    total: 0,
    observaciones: organization.settings.quotations.notes || "",
    paymentTerms: organization.settings.quotations.paymentTerms[0] || "",
    shippingTerms: organization.settings.quotations.shippingTerms[0] || "",
    creationDate: format(new Date(), "yyyy-MM-dd"),
    lastModified: format(new Date(), "yyyy-MM-dd"),
    optionalItems: [],
    userId: "",
  });

  const { showLoading, hideLoading } = useLoading();
  const [showContactModal, setShowContactModal] = useState(false);
  const id = useParams().id;
  const toast = useToast();
  const navigate = useNavigate();

  const getQuote = async () => {
    if (id) {
      try {
        showLoading("Cargando cotización...");
        const quote = await quotesService.getQuoteById(id);
        setQuote(quote.data);
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
    if (organization.settings.quotations.quotationNumber) {
      setQuote((prev) => ({
        ...prev,
        quotationNumber: organization.settings.quotations.quotationNumber,
      }));
    }
  }, [organization.settings.quotations.quotationNumber]);

  const handleSelectContact = (contact: Contact) => {
    setQuote((prev) => ({
      ...prev,
      contact: {
        ...(prev.contact || {}),
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        mobile: contact.phone || "",
        companyName: contact.companyName || "",
        taxId: contact.taxId || "",
        id: contact.id,
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
    }));
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
    field: keyof QuoteItem,
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
      console.log("Saving quote", quote);
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

      const quoteData = {
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
        discount: Number(quote.discount),
        taxes: Number(quote.taxes),
        total: Number(quote.total),
        lastModified: format(new Date(), "yyyy-MM-dd"),
        name: `${organization.settings.quotations.quotationNumber} - ${quote.contact.firstName}`,
        paymentTerms: organization.settings.quotations.paymentTerms[0] || "", // Asignar valor por defecto
        shippingTerms: organization.settings.quotations.shippingTerms[0] || "", // Asignar valor por defecto
        notes: organization.settings.quotations.notes || "",
        observaciones: organization.settings.quotations.notes || "",
      };

      if (id) {
        await quotesService.updateQuote(id as string, quoteData);
        toast.show({
          title: "Actualizada",
          description: "Cotización actualizada correctamente",
          type: "success",
        });
      } else {
        await quotesService.createQuote(quoteData as Quote);
        toast.show({
          title: "Creada",
          description: "Cotización creada correctamente",
          type: "success",
        });
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
                    id: quote.contact?.id || "",
                    createdAt: quote.contact?.createdAt || "",
                    updatedAt: quote.contact?.updatedAt || "",
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
