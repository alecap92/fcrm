import { apiService } from "../config/apiConfig";

interface SummaryData {
  totalSales: number;
  newCustomers: number;
  averageTicket: number;
  products: number;
  fromDate: string;
  toDate: string;
}

interface MonthlySale {
  month: string;
  ventas: number;
}

interface TopCustomer {
  total: number;
  count: number;
  [key: string]: any;
}

interface ReportsOverviewResponse {
  summary: SummaryData;
  salesByMonth: MonthlySale[];
  topCustomersWithDetails: TopCustomer[];
}

const getOverview = async (fromDate: string, toDate: string) => {
  const res = await apiService.get(
    `/reports/overview?fromDate=${fromDate}&toDate=${toDate}`
  );
  return res;
};

const reportsService = {
  getOverview,
};

export default reportsService;
