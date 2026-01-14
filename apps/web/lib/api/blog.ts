import { apiClient } from './client';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: {
    id: number;
    name: string;
    bio?: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime?: string;
  category: {
    id: number;
    name: string;
  };
  tags?: string[];
  thumbnailUrl?: string;
}

export const blogAPI = {
  getPosts: (params?: any) => 
    apiClient.get<BlogPost[]>('/blog/posts', { params }),
  
  getPostBySlug: (slug: string) => 
    apiClient.get<BlogPost>(`/blog/posts/${slug}`),
  
  getRelatedPosts: (slug: string) => 
    apiClient.get<BlogPost[]>(`/blog/posts/${slug}/related`),
};
