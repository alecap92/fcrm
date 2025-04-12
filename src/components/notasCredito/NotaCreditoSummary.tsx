import { InvoiceItem } from "../../types/invoice";

interface NotaCreditoSummaryProps {
  items: InvoiceItem[];
}

export function NotaCreditoSummary({ items }: NotaCreditoSummaryProps) {
  const lineExtensionAmount = items.reduce((sum, item) => {
    const quantity = Number(item.invoiced_quantity) || 0;
    const price = Number(item.price_amount) || 0;
    return sum + (quantity * price);
  }, 0).toFixed(2);

  const taxExclusiveAmount = lineExtensionAmount;
  const taxInclusiveAmount = (Number(lineExtensionAmount) * 1.19).toFixed(2);
  const payableAmount = taxInclusiveAmount;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Resumen</h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">${lineExtensionAmount}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">IVA (19%)</span>
          <span className="font-medium">${(Number(lineExtensionAmount) * 0.19).toFixed(2)}</span>
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Total</span>
            <span className="text-xl font-semibold text-gray-900">
              ${payableAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 