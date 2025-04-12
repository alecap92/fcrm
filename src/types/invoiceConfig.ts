// InvoiceConfig, CompanyInfo, EmailSettings, Placeholders

export interface IEmail {
  mail_username: string;
  mail_password: string;
  mail_host: string;
  mail_port: number;
  mail_encryption: string;
}

export interface IPlaceholders {
  paymentTerms: string;
  shippingTerms: string;
  currency: string;
  notes: string;
  logoImg: string;
  foot_note: string;
  head_note: string;
}

export interface IResolutionNumber {
  type_document_id: string;
  prefix: string;
  resolution: string;
  resolution_date: string;
  from: string;
  to: string;
  date_from: string;
  date_to: string;
  technical_key: string;
}

export interface ICompanyInfo {
  email: string;
  address: string;
  phone: string;
  municipality_id: string;
  type_document_identification_id: string;
  type_organization_id: string;
  type_regime_id: string;
  type_liability_id: string;
  business_name: string;
  nit: string;
  dv: string;
}

export interface ISoftware {
  id: string;
  pin: string;
}

export interface ICertificado {
  certificate: string | File | null;
  password: string;
}

export interface IInvoiceConfig {
  _id?: string;
  nextInvoiceNumber: string;
  resolutionNumber: IResolutionNumber;
  companyInfo: ICompanyInfo;
  placeholders: IPlaceholders;
  token?: string;
  organizationId?: string;
  email: IEmail;
  software: ISoftware;
  certificado: ICertificado;
  status: boolean;
}
