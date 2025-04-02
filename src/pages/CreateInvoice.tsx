import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import type { Invoice } from "../types/invoice";
import type { Contact } from "../types/contact";
import { useAuth } from "../contexts/AuthContext";
import invoiceService from "../services/invoiceService";
import { useToast } from "../components/ui/toast";
import { InvoiceHeader } from "../components/invoices/InvoiceHeader";
import { InvoiceItems } from "../components/invoices/InvoiceItems";
import { InvoiceNotes } from "../components/invoices/InvoiceNotes";
import { CustomerInfo } from "../components/invoices/CustomerInfo";
import { InvoiceDates } from "../components/invoices/InvoiceDates";
import { InvoiceSummary } from "../components/invoices/InvoiceSummary";
import { ContactSelectionModal } from "../components/invoices/ContactSelectionModal";

export function CreateInvoice() {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const toast = useToast();
  const [showContactModal, setShowContactModal] = useState(false);

  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    number: `INV-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 1000)
    ).padStart(3, "0")}`,
    date: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    status: "draft",
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
  });

  const handleSelectContact = (contact: Contact) => {
    setInvoice((prev) => ({
      ...prev,
      customer: contact,
    }));

    console.log(contact);
  };

  const calculateTotals = (updatedItems: Invoice["items"]) => {
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const totalDiscount = updatedItems.reduce(
      (sum, item) => sum + item.discount,
      0
    );
    const totalTax = updatedItems.reduce((sum, item) => sum + item.tax, 0);
    const total = subtotal - totalDiscount + totalTax;

    setInvoice((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total,
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item_${Date.now()}`,
      description: "",
      name: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
      total: 0,
    };
    const updatedItems = [...(invoice.items || []), newItem];
    calculateTotals(updatedItems);
  };

  const handleUpdateItemField = (
    index: number,
    field: keyof Invoice["items"][0],
    value: string | number
  ) => {
    const updatedItems = [...(invoice.items || [])];
    const item = { ...updatedItems[index], [field]: value };

    const subtotal = item.quantity * item.unitPrice;
    item.total = subtotal - item.discount + item.tax;

    updatedItems[index] = item;
    calculateTotals(updatedItems);
  };

  const handleReplaceItem = (index: number, newItem: Invoice["items"][0]) => {
    const updatedItems = [...(invoice.items || [])];
    updatedItems[index] = newItem;
    calculateTotals(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = (invoice.items || []).filter((_, i) => i !== index);
    calculateTotals(updatedItems);
  };

  const handleSave = async () => {
    try {
      if (!invoice.customer) {
        toast.show({
          title: "Error",
          description: "Please select a customer",
          type: "error",
        });
        return;
      }

      if (!invoice.customer.taxId) {
        toast.show({
          title: "Error",
          description: "Please provide a tax ID for the customer",
          type: "error",
        });
        return;
      }

      if (!invoice.customer.firstName) {
        toast.show({
          title: "Error",
          description: "Please provide a name for the customer",
          type: "error",
        });
        return;
      }

      const invoiceData = {
        ...invoice,
        items: (invoice.items || []).map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          tax: Number(item.tax),
          total: Number(item.total),
        })),
        subtotal: Number(invoice.subtotal),
        discount: Number(invoice.discount),
        tax: Number(invoice.tax),
        total: Number(invoice.total),
      };

      await invoiceService.createInvoice(
        invoiceData as Omit<Invoice, "_id" | "createdAt" | "updatedAt">
      );

      toast.show({
        title: "Success",
        description: "Invoice created successfully",
        type: "success",
      });

      navigate("/invoices");
    } catch (error: any) {
      console.error("Error creating invoice:", error);

      if (error.name === "InvoiceValidationError") {
        const errorMessages = error.errors
          .map((err: any) => err.message)
          .join("\n");
        toast.show({
          title: "Validation Error",
          description: errorMessages,
          type: "error",
        });
      } else {
        toast.show({
          title: "Error",
          description: error.message || "Failed to create invoice",
          type: "error",
        });
      }
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
              onClick={() => navigate("/invoices")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Nueva Factura
              </h1>
              <p className="mt-1 text-sm text-gray-500">{invoice.number}</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <InvoiceHeader
              organization={organization}
              invoiceNumber={invoice.number!}
              date={invoice.date!}
              dueDate={invoice.dueDate!}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <InvoiceItems
                  items={invoice.items || []}
                  onAddItem={handleAddItem}
                  onUpdateItemField={handleUpdateItemField}
                  onReplaceItem={handleReplaceItem}
                  onRemoveItem={handleRemoveItem}
                />

                <InvoiceNotes
                  notes={invoice.notes}
                  terms={invoice.terms}
                  onNotesChange={(notes) =>
                    setInvoice((prev) => ({ ...prev, notes }))
                  }
                  onTermsChange={(terms) =>
                    setInvoice((prev) => ({ ...prev, terms }))
                  }
                />
              </div>

              <div className="space-y-6">
                <CustomerInfo
                  customer={invoice.customer!}
                  onChangeCustomer={() => setShowContactModal(true)}
                />

                <InvoiceDates
                  date={invoice.date!}
                  dueDate={invoice.dueDate!}
                  onDateChange={(date) =>
                    setInvoice((prev) => ({ ...prev, date }))
                  }
                  onDueDateChange={(dueDate) =>
                    setInvoice((prev) => ({ ...prev, dueDate }))
                  }
                />

                <InvoiceSummary
                  subtotal={invoice.subtotal!}
                  discount={invoice.discount!}
                  tax={invoice.tax!}
                  total={invoice.total!}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/invoices")}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
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
