import { Building2, Mail, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import type { Invoice } from '../../types/invoice';

interface CustomerInfoProps {
  customer: Invoice['customer'];
  onChangeCustomer: () => void;
}

export function CustomerInfo({ customer, onChangeCustomer }: CustomerInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Información del Cliente</h2>
      </div>
      <div className="p-4">
        {customer?.name ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {customer.name}
                  </h3>
                  <div className="mt-1 text-sm text-gray-500">
                    {customer.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onChangeCustomer}
              >
                Cambiar
              </Button>
            </div>
            {customer.address && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Dirección de Facturación
                </h4>
                <address className="text-sm text-gray-600 not-italic">
                  {customer.address.street}<br />
                  {customer.address.city}, {customer.address.state}<br />
                  {customer.address.country} {customer.address.zipCode}
                </address>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={onChangeCustomer}
          >
            Seleccionar Cliente
          </Button>
        )}
      </div>
    </div>
  );
}