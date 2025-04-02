export interface Deal {
  _id?: string;
  title: string;
  associatedContactId: {
    _id: string;
    properties: any;
  };
  amount: number;
  closingDate: string;
  createdAt: string;
  updatedAt: string;
  fields?: any;
  organizationId?: string;
  pipeline: string;
  status: DealStatus;
}

export interface DealStatus {
  _id: string;
  name: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  pipelineId: string;
}

export type DealStage =
  | "lead"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface DealColumn {
  _id: string;
  name: string;
  color?: string;
}

export interface DealFilter {
  search?: string;
  stages?: DealStage[];
  tags?: string[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  valueRange?: {
    min: number;
    max: number;
  };
  probability?: number[];
}
