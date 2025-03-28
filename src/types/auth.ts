export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "user";
  createdAt: string;
  organizationId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
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
