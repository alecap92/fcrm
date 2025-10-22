import { apiService } from "../config/apiConfig";
import { Quote } from "../types/quote";

interface QuotationResponse {
  quotations: Quote[];
  totalPages: number;
  currentPage: number;
  totalQuotations: number;
}

const getQuotes = async (page: number, limit: number) =>
  await apiService.get<QuotationResponse>(
    `/quotations?page=${page}&limit=${limit}`
  );

const getQuoteById = async (id: string) =>
  await apiService.get<Quote>(`/quotations/${id}`);

const searchQuotes = async (search: string) =>
  await apiService.get<QuotationResponse>(`/quotations/search?term=${search}`);

const createQuote = async (quote: Omit<Quote, "id">) =>
  await apiService.post<Quote>("/quotations", quote);

const updateQuote = async (id: string, quote: Partial<Quote>) =>
  await apiService.put<Quote>(`/quotations/${id}`, quote);

const deleteQuote = async (id: string) =>
  await apiService.delete(`/quotations/${id}`);

const printQuote = async (id: string) =>
  await apiService.get<Blob>(`/quotations/print/${id}`, {
    responseType: "blob",
    timeout: 60000, // 60 segundos para generación de PDF (proceso que incluye Puppeteer)
  });

const sendQuote = async (form: {
  quotationNumber: string;
  to: string;
  subject: string;
  templateId: string;
  from: string;
}) => await apiService.post("/quotations/send-email", form);

interface NextQuotationNumberResponse {
  quotationNumber: number;
  message: string;
}

const getNextQuotationNumber = async () =>
  await apiService.get<NextQuotationNumberResponse>(
    "/quotations/next-quotation-number"
  );

const quotesService = {
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  searchQuotes,
  printQuote,
  sendQuote,
  getNextQuotationNumber,
};

export default quotesService;
