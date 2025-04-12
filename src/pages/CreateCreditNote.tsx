import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { CustomerInfo } from '../components/notasCredito/CustomerInfo';
import { NotaCreditoSummary } from '../components/notasCredito/NotaCreditoSummary';
import { NotaCreditoItems } from '../components/notasCredito/NotaCreditoItems';
import { ContactSelectionModal } from '../components/invoices/ContactSelectionModal';
import type { Contact } from '../types/contact';
import { useToast } from '../components/ui/toast';
import { useNotasCredito } from '../hooks/useNotasCredito';
import { validateNotaCredito, validateNotaCreditoTotals, formatValidationErrors } from '../components/notasCredito/notasCreditoValidation';
import invoiceService from '../services/invoiceService';

export const NotasCredito = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { createNotaCredito } = useNotasCredito();
  const [showContactModal, setShowContactModal] = useState(false);
  const [customer, setCustomer] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));

  const [razonDevolucion, setRazonDevolucion] = useState('');
  const [notas, setNotas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleSelectContact = (contact: Contact) => {
    setCustomer(contact);
    setShowContactModal(false);
  };

  const fetchInvoices = async () => {
  try{
    const response:any = await invoiceService.getInvoices();

    setInvoices(response.data.data[0].documents);
    console.log(response.data.data[0].documents)

  } catch(error){
    console.error("Error al obtener las facturas:", error);
  }
  
  }

  const handleSelectInvoice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invoiceNumber = e.target.value;
    const invoice = invoices.find(inv => inv.number === invoiceNumber);
    setSelectedInvoice(invoice);
    
    // Actualizar items si hay una factura seleccionada
    if (invoice && invoice.request_api) {
      try {
        const requestData = JSON.parse(invoice.request_api);
        if (requestData.invoice_lines && requestData.invoice_lines.length > 0) {
          const updatedItems = requestData.invoice_lines.map((line: any) => ({
            unit_measure_id: line.unit_measure_id,
            invoiced_quantity: line.invoiced_quantity,
            line_extension_amount: line.line_extension_amount,
            free_of_charge_indicator: line.free_of_charge_indicator,
            tax_totals: line.tax_totals,
            description: line.description,
            notes: line.notes || "",
            code: line.code,
            type_item_identification_id: line.type_item_identification_id,
            price_amount: line.price_amount,
            base_quantity: line.base_quantity
          }));
          setItems(updatedItems);
        }
      } catch (error) {
        console.error('Error al procesar los items de la factura:', error);
        toast.show({
          title: "Error",
          description: "No se pudieron cargar los items de la factura",
          type: "error",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Validación previa del cliente
      if (!customer) {
        toast.show({
          title: "Error",
          description: "Debe seleccionar un cliente antes de crear la nota de crédito",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }



      // Validación previa de la factura
      if (!selectedInvoice || !selectedInvoice.client) {
        toast.show({
          title: "Error",
          description: "Debe seleccionar una factura válida antes de crear la nota de crédito",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // Calcular totales
      const lineExtensionAmount = items.reduce((acc, item) => {
        const quantity = Number(item.invoiced_quantity) || 0;
        const price = Number(item.price_amount) || 0;
        return acc + (quantity * price);
      }, 0).toFixed(2);

      const taxExclusiveAmount = lineExtensionAmount;
      const taxInclusiveAmount = (Number(lineExtensionAmount) * 1.19).toFixed(2);
      const payableAmount = taxInclusiveAmount;
      
      // todo: traer el resolution_number y prefix, number

      const notaCredito = {
        discrepancyresponsecode: Number(razonDevolucion),
        discrepancyresponsedescription: razonDevolucion === "2" ? "Anulación de factura electrónica" : razonDevolucion,
        notes: notas,
        resolution_number: "0000000000",
        prefix: "NC",
        number: 82,
        date: fecha,
        billing_reference: {
          number: selectedInvoice?.number || "",
          uuid: invoices.find(invoice => invoice.number === selectedInvoice?.number)?.cufe || "",
          issue_date: selectedInvoice?.created_at ? selectedInvoice.created_at.split(' ')[0] : ""
        },
        customer: {
          identification_number: customer?.idNumber ? Number(customer.idNumber) : 0,
          dv: customer?.dv || "0",
          name: customer ? `${customer.firstName} ${customer.lastName}`.trim() : "",
          phone: customer?.phone || customer?.mobile || "",
          address: customer?.address?.street || "",
          email: customer?.email || "",
          merchant_registration: customer?.merchant_registration || "0000000-00",
          type_document_identification_id: customer?.type_document_identification_id || 6,
          type_organization_id: customer?.type_organization_id || 1,
          municipality_id: customer?.municipality_id || 822,
          type_regime_id: customer?.type_regime_id || 1
        },
        legal_monetary_totals: {
          line_extension_amount: lineExtensionAmount,
          tax_exclusive_amount: taxExclusiveAmount,
          tax_inclusive_amount: taxInclusiveAmount,
          payable_amount: payableAmount
        },
        tax_totals: [{
          tax_id: 1,
          tax_amount: (Number(lineExtensionAmount) * 0.19).toFixed(2),
          percent: "19",
          taxable_amount: lineExtensionAmount
        }],
        type_document_id: 4,
        credit_note_lines: items.map(item => {
          const quantity = Number(item.invoiced_quantity) || 0;
          const price = Number(item.price_amount) || 0;
          const lineTotal = (quantity * price).toFixed(2);
          
          return {
            unit_measure_id: 70,
            invoiced_quantity: quantity.toString(),
            line_extension_amount: lineTotal,
            free_of_charge_indicator: false,
            allowance_charges: [{
              charge_indicator: false,
              allowance_charge_reason: "DESCUENTO GENERAL",
              amount: "0.00",
              base_amount: lineTotal
          }],
            tax_totals: [{
              tax_id: 1,
              tax_amount: (Number(lineTotal) * 0.19).toFixed(2),
              taxable_amount: lineTotal,
              percent: "19.00"
            }],
            description: item.description || "",
            notes: item.notes || "",
            code: item.code || "",
            type_item_identification_id: item.type_item_identification_id || 4,
            price_amount: price.toString(),
            base_quantity: quantity.toString()
          };
        })
      };

      // Validar datos de la nota de crédito después de formatearlos
      const validationErrors = validateNotaCredito({
        customer: notaCredito.customer,
        items: items,
        fecha: notaCredito.date,
        noFactura: notaCredito.billing_reference.number,
        razonDevolucion: notaCredito.discrepancyresponsedescription,
        fechaFactura: selectedInvoice?.created_at || "",
        clienteFactura: {
          identification_number: selectedInvoice?.client?.identification_number || 0,
          name: selectedInvoice?.client?.name || ""
        }
      });

      // Validar totales usando los items originales
      const totalErrors = validateNotaCreditoTotals(items);

      // Combinar todos los errores
      const allErrors = [...validationErrors, ...totalErrors];

      if (allErrors.length > 0) {
        toast.show({
          title: "Error de validación",
          description: formatValidationErrors(allErrors),
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      await createNotaCredito(notaCredito);
      
      toast.show({
        title: "Éxito",
        description: "Nota de crédito creada correctamente",
        type: "success",
      });
      
      navigate("/invoices");
    } catch (error) {
      console.error("Error al guardar la nota de crédito:", error);
      toast.show({
        title: "Error",
        description: "Hubo un error al crear la nota de crédito",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(selectedInvoice)

  useEffect(() => {
    fetchInvoices();
  }, []);

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
                Nueva Nota de Crédito
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Referencia: {selectedInvoice?.number}
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                      <h2 className="text-lg font-medium text-gray-900">
                        Información General
                      </h2>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Fecha
                          </label>
                          <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            No. de Factura
                          </label>
                          <select
                            value={selectedInvoice?.number || ""}
                            onChange={handleSelectInvoice}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                          >
                            <option value="">Seleccione una factura</option>
                            {invoices.map((invoice) => (
                              <option key={invoice.number} value={invoice.number}>
                                {invoice.prefix}-{invoice.number} - {invoice.client.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Razón de Devolución
                        </label>
                        <select
                          value={razonDevolucion}
                          onChange={(e) => setRazonDevolucion(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                        >
                          <option value="">Seleccione una razón</option>
                          <option value="1">Devolución parcial de los bienes y/o no aceptación parcial del servicio</option>
                          <option value="2">Anulación de factura electrónica</option>
                          <option value="3">Rebaja o descuento parcial o total</option>
                          <option value="4">Ajuste de precio</option>
                          <option value="5">Otros</option>
                          <option value="6">Descuento comercial por volumen de ventas</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Notas
                        </label>
                        <textarea
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
                          placeholder="Ingrese notas adicionales..."
                        />
                      </div>
                    </div>
                  </div>

                  <NotaCreditoItems items={items} setItems={setItems} />
                </div>

                <div className="space-y-6">
                  <CustomerInfo
                    customer={customer}
                    onChangeCustomer={(e) => {
                      e?.preventDefault();
                      setShowContactModal(true);
                    }}
                  />

                  <NotaCreditoSummary items={items} />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/invoices")}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </div>
              </div>
            </form>
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
}; 