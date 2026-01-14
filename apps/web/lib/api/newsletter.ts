import { apiClient } from './client';

export interface NewsletterSubscribeData {
  email: string;
}

export const newsletterAPI = {
  subscribe: (data: NewsletterSubscribeData) => {
    return apiClient.post('/newsletter/subscribe', data);
  },
};
