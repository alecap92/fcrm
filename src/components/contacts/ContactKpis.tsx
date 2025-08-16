import { BarChart3, CheckCircle2, Timer } from "lucide-react";
import StatCard from "../ui/StatCard";

type ContactKpisProps = {
  totalRevenue: number | string;
  lastDealDate?: Date | string | null;
  leadScore?: number;
};

export function ContactKpis({ totalRevenue, lastDealDate, leadScore }: ContactKpisProps) {
  const lastDealText = lastDealDate
    ? new Date(lastDealDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Sin negocios";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <StatCard
        title="Total Revenue"
        value={`$${Number(totalRevenue || 0).toLocaleString()}`}
        icon={<BarChart3 className="h-8 w-8 text-indigo-500" />}
      />
      <StatCard
        title="Ultimo pedido"
        value={lastDealText}
        icon={<Timer className="h-8 w-8 text-orange-500" />}
      />
      <StatCard
        title="Lead Score"
        value={leadScore ?? 0}
        icon={<CheckCircle2 className="h-8 w-8 text-blue-500" />}
      />
    </div>
  );
}

export default ContactKpis;


