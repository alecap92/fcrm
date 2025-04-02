import { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import reportsService from "../services/reportsService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Metric {
  title: string;
  value: number;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  color: string;
}

interface MonthlySale {
  month: string;
  ventas: number;
}

interface TopCustomer {
  _id: string;
  total: number;
  count: number;
  firstName: string;
}

interface SummaryData {
  totalSales: number;
  newCustomers: number;
  averageTicket: number;
  products: number;
  fromDate: string;
  toDate: string;
}

interface ReportsOverviewResponse {
  summary: SummaryData;
  salesByMonth: MonthlySale[];
  topCustomers: TopCustomer[];
}

export function Reports() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const today = new Date();

  const [dateRange, setDateRange] = useState({
    start: format(
      new Date(today.getFullYear(), today.getMonth(), 1),
      "yyyy-MM-dd"
    ),
    end: format(today, "yyyy-MM-dd"),
  });

  const fetchData = async () => {
    try {
      const response: any = await reportsService.getOverview(
        dateRange.start,
        dateRange.end
      );

      const summary = response?.data.summary;
      setMetrics([
        {
          title: "Ventas Totales",
          value: summary.totalSales,
          change: "+12.5%",
          trend: "up",
          icon: DollarSign,
          color: "bg-green-500",
        },
        {
          title: "Nuevos Clientes",
          value: summary.newCustomers,
          change: "+8.2%",
          trend: "up",
          icon: Users,
          color: "bg-blue-500",
        },
        {
          title: "Productos Vendidos",
          value: summary.products,
          change: "-3.1%",
          trend: "down",
          icon: Package,
          color: "bg-purple-500",
        },
        {
          title: "Ticket Promedio",
          value: summary.averageTicket,
          change: "+5.4%",
          trend: "up",
          icon: ShoppingCart,
          color: "bg-orange-500",
        },
      ]);

      setMonthlySales(response.data.salesByMonth);
      setTopCustomers(response.data.topCustomersWithDetails);
    } catch (error) {
      console.error("Error al obtener reportes:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Análisis y métricas de tu negocio
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="text-sm border-0 bg-transparent focus:ring-0"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="text-sm border-0 bg-transparent focus:ring-0"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`
                  inline-flex items-center text-sm font-medium rounded-full px-2 py-1
                  ${
                    metric.trend === "up"
                      ? "text-green-600 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }
                `}
                >
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {metric.change}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-gray-900">
                {metric.title === "Ticket Promedio" ||
                metric.title === "Ventas Totales"
                  ? `$${metric.value?.toLocaleString()}`
                  : metric.value?.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500">{metric.title}</p>
            </div>
          ))}
        </div>

        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Ventas Últimos 12 Meses
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlySales}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Bar dataKey="ventas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Mejores Clientes
            </h2>
            <div className="space-y-4">
              {topCustomers?.map((customer) => (
                <div key={customer._id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {customer.firstName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Ventas: ${customer.total.toLocaleString()} (
                      {customer.count} negocios)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
