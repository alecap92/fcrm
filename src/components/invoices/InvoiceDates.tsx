import { Calendar } from 'lucide-react';

interface InvoiceDatesProps {
  date: string;
  dueDate: string;
  onDateChange: (date: string) => void;
  onDueDateChange: (dueDate: string) => void;
}

export function InvoiceDates({ date, dueDate, onDateChange, onDueDateChange }: InvoiceDatesProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Detalles de la Factura</h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Emisión
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Vencimiento
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="block w-full pl-10 rounded-md border-gray-300 focus:border-action focus:ring focus:ring-action focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}