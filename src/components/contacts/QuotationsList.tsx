import { File } from "lucide-react";
import { Quote } from "../../types/quote";

type QuotationsListProps = {
  quotations: Quote[];
  onPrint: (quotationNumber: string) => void;
};

export default function QuotationsList({ quotations, onPrint }: QuotationsListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Cotizaciones</h2>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          {quotations.length > 0 ? (
            quotations.map((quotation) => (
              <div className="flex items-center space-x-2" key={quotation._id}>
                <File className="h-5 w-5 text-gray-400" />
                <div className="flex gap-2">
                  <p
                    className="text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={() => onPrint(quotation.quotationNumber)}
                  >
                    {quotation.quotationNumber}
                  </p>
                  <p className="text-gray-500">
                    ({new Date(quotation.creationDate).toLocaleDateString()})
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay cotizaciones</p>
          )}
        </div>
      </div>
    </div>
  );
}


