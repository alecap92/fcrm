import { DollarSign } from "lucide-react";

type Deal = {
  _id: string;
  title: string;
  closingDate: string | Date;
  amount: number;
  status?: { name?: string };
};

type DealsListProps = {
  deals: Deal[];
  onOpen: (dealId: string) => void;
};

export default function DealsList({ deals, onOpen }: DealsListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Deals</h2>
      <div className="space-y-4">
        {deals.length > 0 ? (
          deals.map((deal) => (
            <div key={deal._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3
                    className="font-medium cursor-pointer hover:text-indigo-600 transition-colors text-blue-500"
                    onClick={() => onOpen(deal._id)}
                  >
                    {deal.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(deal.closingDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-sm text-gray-500">Etapa: </span>
                    {deal?.status?.name}
                  </p>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-500">
                    {deal.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${100}%` }} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No hay negocios</p>
        )}
      </div>
    </div>
  );
}


