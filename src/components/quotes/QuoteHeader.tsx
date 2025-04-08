import { Building2 } from "lucide-react";
import { format } from "date-fns";
import type { Organization } from "../../types/settings";

interface QuoteHeaderProps {
  organization: Organization;
  quoteNumber: string;
  date: string;
  dueDate: string;
}

export function QuoteHeader({
  organization,
  quoteNumber,
  date,
  dueDate,
}: QuoteHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex justify-between items-start">
        {/* Company Info */}
        <div className="flex items-start gap-4">
          {organization.logoUrl ? (
            <img
              src={organization.logoUrl}
              alt={organization.companyName}
              className="w-32 h-auto object-contain"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-lg">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {organization.companyName}
            </h2>
            <p className="text-gray-600">{organization.email}</p>
            <p className="text-gray-600">{organization.phone}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {quoteNumber || "Sin número"}
          </div>
          <div className="text-gray-600">
            <p>Fecha: {format(new Date(date), "dd/MM/yyyy")}</p>
            <p>Vencimiento: {format(new Date(dueDate), "dd/MM/yyyy")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
