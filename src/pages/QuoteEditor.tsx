import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import type { Quote, QuoteItem } from '../types/quote';
import type { Contact } from '../types/contact';
import { useAuth } from '../contexts/AuthContext';
import quotesService from '../services/quotesService';
import { useToast } from '../components/ui/toast';
import { InvoiceHeader } from '../components/invoices/InvoiceHeader';
import { InvoiceItems } from '../components/invoices/InvoiceItems';
import { InvoiceNotes } from '../components/invoices/InvoiceNotes';
import { CustomerInfo } from '../components/invoices/CustomerInfo';
import { InvoiceDates } from '../components/invoices/InvoiceDates';
import { InvoiceSummary } from '../components/invoices/InvoiceSummary';
import { ContactSelectionModal } from '../components/invoices/ContactSelectionModal';

interface QuoteEditorProps {
  initialQuote?: Quote;
}

export function QuoteEditor({ initialQuote }: QuoteEditorProps) {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const toast = useToast();
  const [showContactModal, setShowContactModal] = useState(false);
  const [quote, setQuote] = useState<Partial<Quote>>(initialQuote || {
    quotationNumber: `QT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    expirationDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    name: '',
    status: 'draft',
    contactId: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      companyName: '',
    },
    items: [],
    subtotal: 0,
    discount: 0,
    taxes: 0,
    total: 0,
    observaciones: '',
    paymentTerms: '',
    shippingTerms: '',
    creationDate: format(new Date(), 'yyyy-MM-dd'),
    lastModified: format(new Date(), 'yyyy-MM-dd'),
    optionalItems: [],
  });

  const [items, setItems] = useState<QuoteItem[]>(initialQuote?.items || []);

  const handleSelectContact = (contact: Contact) => {
    setQuote(prev => ({
      ...prev,
      contactId: {
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        mobile: contact.phone || '',
        companyName: contact.company || '',
      }
    }));
  };

  const calculateTotals = (updatedItems: QuoteItem[]) => {
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = updatedItems.reduce((sum, item) => sum + item.discount, 0);
    const totalTax = updatedItems.reduce((sum, item) => sum + item.tax, 0);
    const total = subtotal - totalDiscount + totalTax;

    setQuote(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      discount: totalDiscount,
      taxes: totalTax,
      total,
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item_${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
      total: 0,
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const handleUpdateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index], [field]: value };
    
    // Recalculate item total
    const subtotal = item.quantity * item.unitPrice;
    item.total = subtotal - item.discount + item.tax;
    
    updatedItems[index] = item;
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const handleSave = async () => {
    try {
      const quoteData = {
        ...quote,
        items: items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount),
          tax: Number(item.tax),
          total: Number(item.total),
        })),
        subtotal: Number(quote.subtotal),
        discount: Number(quote.discount),
        taxes: Number(quote.taxes),
        total: Number(quote.total),
      };

      if (initialQuote) {
        await quotesService.updateQuote(initialQuote._id, quoteData);
        toast.show({
          title: 'Success',
          description: 'Quote updated successfully',
          type: 'success'
        });
      } else {
        await quotesService.createQuote(quoteData as Quote);
        toast.show({
          title: 'Success',
          description: 'Quote created successfully',
          type: 'success'
        });
      }
      
      navigate('/quotes');
    } catch (error: any) {
      console.error('Error saving quote:', error);
      toast.show({
        title: 'Error',
        description: error.message || 'Failed to save quote',
        type: 'error'
      });
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
              onClick={() => navigate('/quotes')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {initialQuote ? 'Editar Cotización' : 'Nueva Cotización'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {quote.quotationNumber}
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <InvoiceHeader
              organization={organization}
              invoiceNumber={quote.quotationNumber!}
              date={quote.creationDate!}
              dueDate={quote.expirationDate!}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <InvoiceItems
                  items={items}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onRemoveItem={handleRemoveItem}
                />

                <InvoiceNotes
                  notes={quote.observaciones}
                  terms={quote.paymentTerms}
                  onNotesChange={(notes) => setQuote(prev => ({ ...prev, observaciones: notes }))}
                  onTermsChange={(terms) => setQuote(prev => ({ ...prev, paymentTerms: terms }))}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <CustomerInfo
                  customer={{
                    name: `${quote.contactId?.firstName} ${quote.contactId?.lastName}`,
                    email: quote.contactId?.email || '',
                    phone: quote.contactId?.mobile || '',
                    company: quote.contactId?.companyName,
                  }}
                  onChangeCustomer={() => setShowContactModal(true)}
                />

                <InvoiceDates
                  date={quote.creationDate!}
                  dueDate={quote.expirationDate!}
                  onDateChange={(date) => setQuote(prev => ({ ...prev, creationDate: date }))}
                  onDueDateChange={(date) => setQuote(prev => ({ ...prev, expirationDate: date }))}
                />

                <InvoiceSummary
                  subtotal={quote.subtotal!}
                  discount={quote.discount!}
                  tax={quote.taxes!}
                  total={quote.total!}
                />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/quotes')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {initialQuote ? 'Actualizar' : 'Crear'}
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