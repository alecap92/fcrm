export interface AudienceItem {
  name: string;
  completed: boolean;
  description?: string;
  examples?: string[];
}

export interface AudienceSection {
  id: string;
  title: string;
  description: string;
  items: AudienceItem[];
  tips?: string[];
}

export interface AudienceType {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  sections: AudienceSection[];
}

export interface Activity {
  name: string;
  completed: boolean;
}

export interface Channel {
  name: string;
  description: string;
  keyActivities: Activity[];
  completionPercentage: number;
}

export interface FunnelSection {
  id: "tofu" | "mofu" | "bofu";
  title: string;
  leadCount: number;
  color: string;
  content: {
    title: string;
    description: string;
    channels: Channel[];
  };
}
