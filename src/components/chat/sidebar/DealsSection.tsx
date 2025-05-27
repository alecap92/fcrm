import React from "react";
import { Calculator, Plus } from "lucide-react";
import {
  Deal,
  formatDealAmount,
  formatDealClosingDate,
  getDealStatusName,
} from "../../../lib";

interface DealsSectionProps {
  deals: Deal[];
  onCreateDeal: () => void;
}

export const DealsSection: React.FC<DealsSectionProps> = ({
  deals,
  onCreateDeal,
}) => {
  if (deals.length === 0) return null;

  return (
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
      <div className="flex flex-col gap-3 mt-4 max-h-[300px] overflow-y-auto pr-2">
        {deals.map((deal) => (
          <div
            key={deal._id}
            className="flex flex-col p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
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
        ))}
      </div>
    </div>
  );
};
