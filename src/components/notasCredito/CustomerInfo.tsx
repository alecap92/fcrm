import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
import type { Contact } from "../../types/contact";

interface CustomerInfoProps {
  customer: Contact | null;
  onChangeCustomer: (e?: React.MouseEvent) => void;
}

export function CustomerInfo({ customer, onChangeCustomer }: CustomerInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Cliente</h2>
      </div>
      <div className="p-4">
        {customer ? (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Nombre:</span>
              <p className="text-sm text-gray-900">
                {`${customer.firstName} ${customer.lastName}`}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">NIT:</span>
              <p className="text-sm text-gray-900">{customer.taxId}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-sm text-gray-900">{customer.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Teléfono:</span>
              <p className="text-sm text-gray-900">{customer.phone}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Dirección:</span>
              <p className="text-sm text-gray-900">{customer.address?.street}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">
              No se ha seleccionado un cliente
            </p>
          </div>
        )}
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={onChangeCustomer}
            type="button"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {customer ? "Cambiar Cliente" : "Seleccionar Cliente"}
          </Button>
        </div>
      </div>
    </div>
  );
} 