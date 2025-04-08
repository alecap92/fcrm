interface InvoiceSummaryProps {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function InvoiceSummary({ subtotal, discount, tax, total }: InvoiceSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Resumen</h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">${subtotal?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Descuento</span>
          <span className="font-medium text-green-600">-${discount?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Impuestos</span>
          <span className="font-medium">${tax?.toLocaleString()}</span>
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Total</span>
            <span className="text-xl font-semibold text-gray-900">
              ${total?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}