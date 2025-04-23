export interface Document {
    _id:string;
  createdAt: string; 
  fileURL: string;
  url?: string;
  name: string;
  organizationId: string;
  size: number;
  status: string;
  tags: string[];
  type: string;
  updatedAt: string;
  uploadDate: string;
  uploadedBy: {
    _id:string;
    email: string;
  };
}