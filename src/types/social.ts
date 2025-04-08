export interface SocialAccount {
  id: string;
  type: "instagram" | "facebook";
  name: string;
  username: string;
  avatar: string;
  isConnected: boolean;
}

export interface Post {
  _id: string;
  content: string;
  facebookAccountId: string;
  instagramAccountId: string;
  mediaUrls: string[];
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  platforms: string[];
  scheduledFor: string;
  socialAccountId: string;
  status: "draft" | "scheduled" | "published" | "failed";
}

export interface PostFormData {
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  instagramAccount: string;
  facebookAccount: string;
  mediaUrls: string[];
}

export interface FormErrors {
  content?: string;
  platforms?: string;
  media?: string;
  date?: string;
}

export interface InstagramAccount {
  id: string;
  name: string;
  instagram_business_account?: {
    id: string;
  };
}
