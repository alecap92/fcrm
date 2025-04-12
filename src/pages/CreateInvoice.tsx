import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import type { Invoice, InvoiceItem } from "../types/invoice";
import type { Contact } from "../types/contact";
import { useAuth } from "../contexts/AuthContext";
import { useInvoiceStore } from "../store/invoiceStore";
import { useToast } from "../components/ui/toast";
import { InvoiceHeader } from "../components/invoices/InvoiceHeader";
import { InvoiceItems } from "../components/invoices/InvoiceItems";
import { InvoiceNotes } from "../components/invoices/InvoiceNotes";
import { CustomerInfo } from "../components/invoices/CustomerInfo";
import { InvoiceDates } from "../components/invoices/InvoiceDates";
import { InvoiceSummary } from "../components/invoices/InvoiceSummary";
import { ContactSelectionModal } from "../components/invoices/ContactSelectionModal";
import { SampleInvoice } from "../constants/Invoice";
import { validateInvoice, InvoiceValidationError } from "../components/invoices/InvoiceValidation";
import { calcularDigitoVerificacion } from "../utils/calcularDigitoVerificacion";

export function CreateInvoice() {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const toast = useToast();
  const { createInvoice, fetchInvoiceConfig, invoiceConfig } = useInvoiceStore();
  const [showContactModal, setShowContactModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar con valores por defecto
  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    // Estos valores serán sobrescritos por la configuración cuando se cargue
    number: 1,
    type_document_id: 1, // hardcoded
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm:ss"),
    resolution_number: "",
    prefix: "",
    notes: "",
    disable_confirmation_text: true, // hardcoded
    establishment_address: "",
    establishment_phone: "",
    establishment_municipality: 0,
    establishment_email: "",
    sendmail: true, // hardcoded
    sendmailtome: true, // hardcoded
    send_customer_credentials: false, // hardcoded
    annexes: [], // hardcoded
    html_header: "",
    html_buttons: "",
    html_footer: "",
    head_note: "",
    foot_note: "",

  });

  // Cargar la configuración de factura al iniciar
  useEffect(() => {
    const loadInvoiceConfig = async () => {
      setIsLoading(true);
      try {
        // Ejecutamos la función para obtener la configuración
        await fetchInvoiceConfig();
        
        // Como fetchInvoiceConfig actualiza el estado global, ahora podemos acceder a invoiceConfig
        if (invoiceConfig) {
          console.log("Configuración cargada del estado global :", invoiceConfig);

          const notes = `TÉRMINOS DE PAGO:\n${invoiceConfig.placeholders.paymentTerms}\n\nTÉRMINOS DE ENVÍO:\n${invoiceConfig.placeholders.shippingTerms}\n\n${invoiceConfig.placeholders.notes}`
          
          setInvoice(prev => ({
            ...prev,
            number: parseInt(invoiceConfig.nextInvoiceNumber) || 1,
            resolution_number: invoiceConfig.resolutionNumber.resolution,
            prefix: invoiceConfig.resolutionNumber.prefix,
            establishment_address: invoiceConfig.companyInfo.address,
            establishment_phone: invoiceConfig.companyInfo.phone,
            establishment_municipality: parseInt(invoiceConfig.companyInfo.municipality_id) || 600,
            establishment_email: invoiceConfig.companyInfo.email,
            notes: notes,
            head_note: invoiceConfig.placeholders.head_note,
            foot_note: invoiceConfig.placeholders.foot_note,
            html_header: SampleInvoice.html_header,
            html_buttons: SampleInvoice.html_buttons,
            html_footer: SampleInvoice.html_footer,
          }));
        } else {
          // Si no hay configuración, usar valores de la muestra
          console.log("Usando configuración de muestra (no hay datos en el estado global)");
          setInvoice(prev => ({
            ...prev,
            number: 2,
            resolution_number: SampleInvoice.resolution_number,
            prefix: SampleInvoice.prefix,
            establishment_address: SampleInvoice.establishment_address,
            establishment_phone: SampleInvoice.establishment_phone,
            establishment_municipality: SampleInvoice.establishment_municipality,
            establishment_email: SampleInvoice.establishment_email,
            notes: SampleInvoice.notes,
            foot_note: SampleInvoice.foot_note,
            html_header: SampleInvoice.html_header,
            html_buttons: SampleInvoice.html_buttons,
            html_footer: SampleInvoice.html_footer,
          }));
        }
      } catch (error) {
        console.error("Error al cargar la configuración de factura:", error);
        toast.show({
          title: "Error",
          description: "No se pudo cargar la configuración de factura",
          type: "error",
        });
        
        // En caso de error usar los valores de muestra
        setInvoice(prev => ({
          ...prev,
          number: SampleInvoice.number,
          resolution_number: SampleInvoice.resolution_number,
          prefix: SampleInvoice.prefix,
          establishment_address: SampleInvoice.establishment_address,
          establishment_phone: SampleInvoice.establishment_phone,
          establishment_municipality: SampleInvoice.establishment_municipality,
          establishment_email: SampleInvoice.establishment_email,
          notes: SampleInvoice.notes,
          foot_note: SampleInvoice.foot_note,
          html_header: SampleInvoice.html_header,
          html_buttons: SampleInvoice.html_buttons,
          html_footer: SampleInvoice.html_footer,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoiceConfig();
  }, [fetchInvoiceConfig, toast]);

  // Cambiamos el tipo de los items
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  const [dueDate, setDueDate] = useState<string>(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );

  const [terms, setTerms] = useState<string>("");
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [totalTax, setTotalTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const handleSelectContact = (contact: Contact) => {
    // Convertir Contact a Customer
    const customer = {
      identification_number: parseInt(contact.taxId || "0"),
      dv: contact.dv, 
      name: `${contact.firstName} ${contact.lastName}`.trim(),
      phone: contact.phone || "",
      address: contact.address?.street || "",
      email: contact.email || "",
      merchant_registration: "0000000-00", 
      type_document_identification_id: 6, 
      type_organization_id: 1, 
      type_liability_id: 7, 
      municipality_id: 822, 
      type_regime_id: 1 
    };

    setInvoice((prev:any) => ({
      ...prev,
      customer
    }));


  };

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotalValue = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    
    const discountValue = items.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );
    
    // Usamos taxes en lugar de tax
    const taxValue = items.reduce(
      (sum, item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        return sum + (itemSubtotal * (item.taxes || 0)) / 100;
      },
      0
    );
    
    const totalValue = subtotalValue - discountValue + taxValue;

    setSubtotal(subtotalValue);
    setTotalDiscount(discountValue);
    setTotalTax(taxValue);
    setTotal(totalValue);
    setInvoiceItems(items);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      description: "",
      name: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxes: 19, // Valor por defecto de IVA (19%)
      total: 0,
      imageUrl: "", // Agregamos este campo requerido
    };
    const updatedItems = [...invoiceItems, newItem];
    calculateTotals(updatedItems);
  };

  const handleUpdateItemField = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updatedItems = [...invoiceItems];
    const item = { ...updatedItems[index], [field]: value };

    // Recalcular el total automáticamente cuando se actualiza cualquier campo
    if (field !== 'total') {
      const subtotal = item.quantity * item.unitPrice;
      const taxValue = (subtotal * (item.taxes || 0)) / 100;
      item.total = subtotal - (item.discount || 0) + taxValue;
    }

    updatedItems[index] = item;
    calculateTotals(updatedItems);
  };

  const handleReplaceItem = (index: number, newItem: InvoiceItem) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = newItem;
    calculateTotals(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    calculateTotals(updatedItems);
  };

  const handleSave = async () => {
    try {
     

      // Transformar los datos para que coincidan con la estructura de Invoice
      const invoiceLines = invoiceItems.map(item => {
        const subtotal = item.quantity * item.unitPrice;
        const taxRate = item.taxes || 19; // Valor por defecto
        
        return {
          unit_measure_id: 70, // Valor por defecto
          invoiced_quantity: item.quantity.toString(),
          line_extension_amount: subtotal.toString(),
          free_of_charge_indicator: false,
          // Añadimos allowance_charges si hay descuento
          ...(item.discount > 0 && {
            allowance_charges: [{
              charge_indicator: false,
              allowance_charge_reason: "DESCUENTO GENERAL",
              amount: item.discount.toString(),
              base_amount: (subtotal + item.discount).toString()
            }]
          }),
          tax_totals: [{
            tax_id: 1,
            tax_amount: ((subtotal * taxRate) / 100).toString(),
            taxable_amount: subtotal.toString(),
            percent: taxRate.toFixed(2)
          }],
          description: item.description || item.name,
          notes: "",
          code: item.name,
          type_item_identification_id: 4, // Valor por defecto
          price_amount: item.unitPrice.toString(),
          base_quantity: item.quantity.toString()
        };
      });

      // Crear la estructura de totales legales monetarios
      const legalMonetaryTotals = {
        line_extension_amount: subtotal.toString(),
        tax_exclusive_amount: subtotal.toString(),
        tax_inclusive_amount: total.toString(),
        allowance_total_amount: "0.00", // Añadir este campo que falta
        payable_amount: total.toString()
      };

      // Crear la estructura de totales de impuestos
      const taxTotals = [{
        tax_id: 1,
        tax_amount: totalTax.toString(),
        percent: "19", // Usar el porcentaje estándar
        taxable_amount: subtotal.toString()
      }];

      // Crear la estructura de forma de pago
      const paymentForm = {
        payment_form_id: 2,
        payment_method_id: 30,
        payment_due_date: dueDate,
        duration_measure: "0"
      };

      const completeInvoice = {
        ...invoice,
        payment_form: paymentForm,
        legal_monetary_totals: legalMonetaryTotals,
        tax_totals: taxTotals,
        invoice_lines: invoiceLines
      };

      if(invoice.customer && !invoice.customer.dv){
        console.log("invoice.customer", invoice.customer);
        console.log("Calculando dígito de verificación del cliente:", invoice.customer.identification_number);
        invoice.customer.dv = calcularDigitoVerificacion(invoice.customer.identification_number.toString());
        console.log("Dígito de verificación del cliente calculado:", invoice.customer.dv);
      }
      
      // Validar la factura antes de enviarla
      validateInvoice(completeInvoice);

      await createInvoice(completeInvoice as Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>);

      toast.show({
        title: "Éxito",
        description: "Factura creada exitosamente.",
        type: "success",
      });

      navigate("/invoices");
    } catch (error: any) {
      console.error("Error al crear factura:", error);

      if (error.name === "InvoiceValidationError") {
        const errorMessages = error.errors
          .map((err: any) => err.message)
          .join("\n");
        toast.show({
          title: "Error de validación",
          description: errorMessages,
          type: "error",
        });
      } else {
        toast.show({
          title: "Error",
          description: error.message || "Error al crear factura",
          type: "error",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Cargando configuración de factura...</p>
        </div>
      </div>
    );
  }

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
              <p className="mt-1 text-sm text-gray-500">{(invoiceConfig?.resolutionNumber?.prefix || "")}-{invoice.number}</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <InvoiceHeader
              organization={organization}
              invoiceNumber={String(invoice.prefix + "-" + invoice.number)}
              date={invoice.date || ""}
              dueDate={dueDate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <InvoiceItems
                  items={invoiceItems as any}
                  onAddItem={handleAddItem}
                  onUpdateItemField={handleUpdateItemField as any}
                  onReplaceItem={handleReplaceItem as any}
                  onRemoveItem={handleRemoveItem}
                />

                <InvoiceNotes
                  notes={invoice.notes}
                  terms={terms}
                  onNotesChange={(notes) =>
                    setInvoice((prev) => ({ ...prev, notes }))
                  }
                  onTermsChange={setTerms}
                  onShippingTermsChange={() => {}}
                />
              </div>

              <div className="space-y-6">
                <CustomerInfo
                  customer={invoice.customer as any}
                  onChangeCustomer={() => setShowContactModal(true)}
                />

                <InvoiceDates
                  date={invoice.date || ""}
                  dueDate={dueDate}
                  onDateChange={(date) =>
                    setInvoice((prev) => ({ ...prev, date }))
                  }
                  onDueDateChange={setDueDate}
                />

                <InvoiceSummary
                  subtotal={subtotal}
                  discount={totalDiscount}
                  tax={totalTax}
                  total={total}
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
