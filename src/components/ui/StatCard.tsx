import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  subtitle?: ReactNode;
};

export function StatCard({ title, value, icon, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <div className="mt-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle ? (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {icon ? <div className="shrink-0">{icon}</div> : null}
      </div>
    </div>
  );
}

export default StatCard;


