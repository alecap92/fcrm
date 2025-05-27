/**
 * Utilidades para el manejo de deals/negocios
 */

export interface Deal {
  _id: string;
  title: string;
  amount: number;
  closingDate: string;
  status?: {
    name: string;
  };
}

/**
 * Formatea el monto de un deal
 */
export const formatDealAmount = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

/**
 * Formatea la fecha de cierre de un deal
 */
export const formatDealClosingDate = (closingDate: string): string => {
  return new Date(closingDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Obtiene el nombre del estado de un deal
 */
export const getDealStatusName = (deal: Deal): string => {
  return deal.status?.name || "Sin etapa";
};

/**
 * Verifica si un deal está próximo a vencer (menos de 7 días)
 */
export const isDealExpiringSoon = (closingDate: string): boolean => {
  const today = new Date();
  const closing = new Date(closingDate);
  const diffTime = closing.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 7 && diffDays >= 0;
};

/**
 * Verifica si un deal está vencido
 */
export const isDealExpired = (closingDate: string): boolean => {
  const today = new Date();
  const closing = new Date(closingDate);

  return closing < today;
};

/**
 * Obtiene el color del estado de un deal basado en la fecha
 */
export const getDealStatusColor = (closingDate: string): string => {
  if (isDealExpired(closingDate)) {
    return "text-red-600";
  } else if (isDealExpiringSoon(closingDate)) {
    return "text-yellow-600";
  }
  return "text-green-600";
};

/**
 * Calcula el total de deals
 */
export const calculateTotalDealsAmount = (deals: Deal[]): number => {
  return deals.reduce((total, deal) => total + deal.amount, 0);
};

/**
 * Filtra deals por estado
 */
export const filterDealsByStatus = (
  deals: Deal[],
  statusName: string
): Deal[] => {
  return deals.filter((deal) => getDealStatusName(deal) === statusName);
};

/**
 * Ordena deals por fecha de cierre
 */
export const sortDealsByClosingDate = (
  deals: Deal[],
  ascending: boolean = true
): Deal[] => {
  return [...deals].sort((a, b) => {
    const dateA = new Date(a.closingDate).getTime();
    const dateB = new Date(b.closingDate).getTime();

    return ascending ? dateA - dateB : dateB - dateA;
  });
};
