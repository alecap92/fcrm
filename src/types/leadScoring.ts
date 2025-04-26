export interface ScoringCondition {
  propertyName: string;
  condition:
    | "exists"
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "in_list"
    // Condiciones relacionadas con deals
    | "LAST_DEAL_OLDER_THAN"
    | "LAST_DEAL_NEWER_THAN"
    | "DEAL_AMOUNT_GREATER_THAN"
    | "DEAL_AMOUNT_LESS_THAN"
    | "DEAL_STATUS_IS"
    | "DEAL_PIPELINE_IS"
    | "TOTAL_DEALS_COUNT_GREATER_THAN"
    | "TOTAL_DEALS_AMOUNT_GREATER_THAN"
    | "HAS_PURCHASED_PRODUCT"
    | "PURCHASE_FREQUENCY_LESS_THAN"
    | "DEAL_FIELD_VALUE_IS";
  value?: string | number | string[];
  points: number;
  _id?: string;
}

export interface ScoringRule {
  id?: string;
  _id?: string; // Campo adicional para manejar _id de MongoDB
  organizationId?: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions?: ScoringCondition[];
  rules?: ScoringCondition[]; // Alternativa para "conditions" según el servidor
  createdAt: string;
  updatedAt: string;
  __v?: number; // Versión de MongoDB
}

export type ContactProperty =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "mobile"
  | "companyName"
  | "position"
  | "address"
  | "city"
  | "state"
  | "lifeCycle"
  | "source";

// Propiedades de deals disponibles para reglas de puntuación
export type DealProperty =
  | "title"
  | "amount"
  | "closingDate"
  | "status"
  | "pipeline"
  | "associatedContactId"
  | "associatedCompanyId"
  | "lastActivityDate"
  | "productsPurchased";

export interface LeadScoringStats {
  totalRules: number;
  activeRules: number;
  totalContactsScored: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
}
