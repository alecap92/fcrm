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
