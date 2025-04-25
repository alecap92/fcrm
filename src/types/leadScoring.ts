export interface ScoringCondition {
  id: string;
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
}

export interface ScoringRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions: ScoringCondition[];
  createdAt: string;
  updatedAt: string;
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
