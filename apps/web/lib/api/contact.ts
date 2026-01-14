import { apiClient } from './client';

export interface ContactSubmitData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactAPI = {
  submit: (data: ContactSubmitData) => {
    return apiClient.post('/contact', data);
  },
};
