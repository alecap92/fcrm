export interface ScoringCondition {
  propertyName: string;
  condition:
    | "exists"
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "in_list";
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

export interface LeadScoringStats {
  totalRules: number;
  activeRules: number;
  totalContactsScored: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
}
