import React, { useEffect, useState } from "react";
import {
  Users,
  ArrowUpRight,
  Clock,
  Globe,
  MousePointerClick,
  ArrowRight,
  Timer,
  Zap,
} from "lucide-react";
import StatCard from "../components/analytics/StatCard";
import LineChart from "../components/analytics/LineChart";
import BarChart from "../components/analytics/BarChart";
import DonutChart from "../components/analytics/DonutChart";
import DateRangePicker from "../components/common/DateRangePicker";
import analyticsService from "../services/analyticsService";

interface DailyMetric {
  date: string;
  activeUsers: number;
  newUsers: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface Summary {
  totalActiveUsers: number;
  totalActiveUsersChange: number;
  totalNewUsers: number;
  totalNewUsersChange: number;
  avgBounceRate: number;
  avgBounceRateChange: number;
  avgSessionDuration: number;
  avgSessionDurationChange: number;
}

interface Metrics {
  daily: DailyMetric[];
  summary: Summary;
}

interface TrafficSource {
  source: string;
  activeUsers: number;
  sessions: number;
}

interface Event {
  name: string;
  count: number;
}

interface TopPage {
  path: string;
  pageViews: number;
  activeUsers: number;
  avgTimeOnPage: number;
}

interface AnalyticsResponse {
  metrics: Metrics;
  trafficSources: TrafficSource[];
  events: Event[];
  topPages: TopPage[];
  dateRanges: {
    currentMonth: {
      start: string;
      end: string;
    };
    previousMonth: {
      start: string;
      end: string;
    };
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const Dashboard: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onStartDateChange = (date: Date) => {
    console.log("1. Fecha de inicio seleccionada:", date);
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    console.log("2. Fecha de inicio ajustada:", newDate);
    setStartDate(newDate);
  };

  const onEndDateChange = (date: Date) => {
    console.log("1. Fecha de fin seleccionada:", date);
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    console.log("2. Fecha de fin ajustada:", newDate);
    setEndDate(newDate);
  };

  const fetchWebsiteAnalytics = async () => {
    setLoading(true);
    console.log("3. Fechas en el estado:");
    console.log("   - startDate:", startDate);
    console.log("   - endDate:", endDate);

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    console.log("4. Fechas formateadas para el backend:");
    console.log("   - formattedStartDate:", formattedStartDate);
    console.log("   - formattedEndDate:", formattedEndDate);

    const response = (await analyticsService.getAnalytics(
      formattedStartDate,
      formattedEndDate
    )) as AnalyticsResponse;

    console.log(response);
    if (!response) {
      setAnalyticsData(null);
      setLoading(false);
      return;
    }

    // 1. Tarjetas principales
    const { metrics, trafficSources, events, topPages = [] } = response;
    const { summary } = metrics;

    // 2. Gráfico Active vs New Users
    const dailyData = metrics.daily;
    const dates = dailyData.map((d) => d.date);
    const activeUsers = dailyData.map((d) => d.activeUsers);
    const newUsers = dailyData.map((d) => d.newUsers);

    // 3. Traffic Source
    const trafficSourceLabels = trafficSources.map((t) => t.source);
    const trafficSourceData = trafficSources.map((t) => t.activeUsers);

    // 4. Events (contador)
    const totalEvents = events.reduce((acc, event) => acc + event.count, 0);

    setAnalyticsData({
      stats: [
        {
          title: "Bounce Rate",
          value: (summary.avgBounceRate * 100).toFixed(2) + "%",
          change: summary.avgBounceRateChange,
          icon: <ArrowUpRight size={20} />,
          bgColor: "bg-navy/10",
          textColor: "text-navy dark:text-blue-400",
        },
        {
          title: "Active Users",
          value: summary.totalActiveUsers,
          change: summary.totalActiveUsersChange,
          icon: <Users size={20} />,
          bgColor: "bg-navy/10",
          textColor: "text-navy dark:text-blue-400",
        },
        {
          title: "Events",
          value: totalEvents,
          change: 0,
          icon: <Zap size={20} />,
          bgColor: "bg-navy/10",
          textColor: "text-navy dark:text-blue-400",
        },
        {
          title: "Avg. Engagement Time",
          value: summary.avgSessionDuration + " minutos",
          change: summary.avgSessionDurationChange,
          icon: <Timer size={20} />,
          bgColor: "bg-navy/10",
          textColor: "text-navy dark:text-blue-400",
        },
      ],
      usersData: {
        labels: dates,
        activeUsers,
        newUsers,
      },
      trafficSource: {
        labels: trafficSourceLabels,
        data: trafficSourceData,
      },
      topPages: Array.isArray(topPages)
        ? topPages.map((page) => ({
            path: page.path,
            views: page.pageViews,
            avgTime: page.avgTimeOnPage,
            bounceRate: "N/A",
            activeUsers: page.activeUsers,
          }))
        : [],
      events,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchWebsiteAnalytics();
    // eslint-disable-next-line
  }, [startDate, endDate]);

  return (
    <div className={`p-4 lg:p-6 ${className} bg-slate-50 dark:bg-slate-900`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track and analyze your performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-20">
          Cargando datos...
        </div>
      ) : !analyticsData ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-20">
          No hay datos disponibles para el rango de fechas seleccionado
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {analyticsData.stats.map((stat: any, index: number) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                bgColor={stat.bgColor}
                textColor={stat.textColor}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Active Users vs New Users
              </h3>
              {analyticsData.usersData?.labels?.length > 0 ? (
                <LineChart
                  data={[
                    {
                      label: "Active Users",
                      data: analyticsData.usersData.activeUsers,
                      color: "rgb(59, 130, 246)",
                    },
                    {
                      label: "New Users",
                      data: analyticsData.usersData.newUsers,
                      color: "rgb(147, 51, 234)",
                    },
                  ]}
                  labels={analyticsData.usersData.labels}
                  title=""
                />
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                  No hay datos disponibles para mostrar
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Traffic Sources
              </h3>
              <div className="max-h-[400px] overflow-y-auto">
                {analyticsData.trafficSource?.labels?.length > 0 ? (
                  <DonutChart
                    data={analyticsData.trafficSource.data}
                    labels={analyticsData.trafficSource.labels}
                    title=""
                    colors={[
                      "rgb(59, 130, 246)",
                      "rgb(147, 51, 234)",
                      "rgb(234, 179, 8)",
                      "rgb(16, 185, 129)",
                      "rgb(239, 68, 68)",
                    ]}
                  />
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                    No hay datos disponibles para mostrar
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Most Visited Pages
              </h3>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        Page Path
                      </th>
                      <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        Views
                      </th>
                      <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        Active Users
                      </th>
                      <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        Avg. Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.topPages?.map(
                      (page: any, index: number) => (
                        <tr
                          key={index}
                          className="border-b border-slate-200 dark:border-slate-700 last:border-0"
                        >
                          <td className="py-3 px-4 text-slate-900 dark:text-white">
                            {page.path}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-900 dark:text-white">
                            {page.views.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-900 dark:text-white">
                            {page.activeUsers.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-900 dark:text-white">
                            {page.avgTime}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Events
              </h3>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        Event Name
                      </th>
                      <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.events?.map((event: any, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-slate-200 dark:border-slate-700 last:border-0"
                      >
                        <td className="py-3 px-4 text-slate-900 dark:text-white">
                          {event.name}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-white">
                          {event.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
