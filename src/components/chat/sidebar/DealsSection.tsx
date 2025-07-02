import React, { useState } from "react";
import { Calculator, Plus } from "lucide-react";
import {
  Deal,
  formatDealAmount,
  formatDealClosingDate,
  getDealStatusName,
} from "../../../lib";
import { DealDetailsModal } from "../../deals/DealDetailsModal";

interface DealsSectionProps {
  deals: Deal[];
  onCreateDeal: () => void;
}

export const DealsSection: React.FC<DealsSectionProps> = ({
  deals,
  onCreateDeal,
}) => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="w-4 h-4 text-gray-500 mr-2" />
            <h3 className="font-semibold text-gray-900 pt-3">
              Negocios Asociados
            </h3>
          </div>
          <div>
            <button
              onClick={onCreateDeal}
              className="text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-4 h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {deals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay negocios asociados
            </div>
          ) : (
            deals.map((deal) => (
              <div
                key={deal._id}
                className="flex flex-col p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setSelectedDeal(deal)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h3 className="text-gray-900 font-semibold text-red-500">
                      {deal.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {formatDealClosingDate(deal.closingDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-medium text-gray-900">
                      {formatDealAmount(deal.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getDealStatusName(deal)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedDeal && (
        <DealDetailsModal
          deal={selectedDeal}
          dealId={selectedDeal._id}
          onClose={() => setSelectedDeal(null)}
          onEdit={() => {
            // Aquí puedes implementar la lógica de edición si es necesario
            setSelectedDeal(null);
          }}
        />
      )}
    </>
  );
};
