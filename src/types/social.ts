export interface SocialAccount {
  id: string;
  type: 'instagram' | 'facebook';
  name: string;
  username: string;
  avatar: string;
  isConnected: boolean;
}

export interface Post {
  id: string;
  content: string;
  media: {
    type: 'image' | 'video' | 'carousel';
    urls: string[];
  }[];
  scheduledFor: string;
  platforms: ('instagram' | 'facebook')[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  tags: string[];
  location?: string;
  mentions?: string[];
}