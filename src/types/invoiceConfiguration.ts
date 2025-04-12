export interface ConfigCompany {
  type_document_identification_id: number;
  type_organization_id: number;
  type_regime_id: number;
  type_liability_id: number;
  business_name: string;
  merchant_registration: string;
  municipality_id: number;
  address: string;
  phone: number;
  email: string;
  mail_host: string;
  mail_port: string;
  mail_username: string;
  mail_password: string;
  mail_encryption: string;
  id_number: string;
  verification_number: string;
}

export interface ConfigSoftware {
  id: string; // El campo id, corresponde al id de software que entrega la DIAN al momento de registrarse como facturador electronico y agregar modo de operacion software propio.
  pin: string;
}
