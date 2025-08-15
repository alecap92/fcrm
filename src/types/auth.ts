export interface User {
  _id?: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "admin" | "user";
  createdAt: string;
  organizationId?: string;
  emailSettings: {
    emailAddress: string;
    imapSettings: {
      host: string;
      port: number;
      tls: boolean;
      user: string;
      password: string;
    };
    smtpSettings: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  expiresIn?: number;
  user: User;
  token: string;
  refreshToken?: string;
  organization: {
    address: any;
    companyName: string;
    contactProperties: [];
    createdAt: string;
    _id: string;
    email: string;
    employees: [];
    idNumber: string;
    idType: string;
    logoUrl: string;
    iconUrl?: string;
    phone: string;
    settings: any;
    updatedAt: string;
    whatsapp: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}
