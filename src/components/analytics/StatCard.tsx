import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  bgColor,
  textColor,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
          </p>
          <div className="flex items-center mt-2.5">
            <span
              className={`text-sm font-medium flex items-center ${
                change >= 0
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              {change >= 0 ? (
                <ArrowUpRight size={16} className="mr-1" />
              ) : (
                <ArrowDownRight size={16} className="mr-1" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-1.5">
              from last period
            </span>
          </div>
        </div>
        <div className={`${bgColor} ${textColor} p-3 rounded-full`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
