import { apiClient } from './client';

export interface InstructorApplicationData {
  fullName: string;
  email: string;
  phone: string;
  expertise: string;
  experience: string;
  courseIdeas: string;
  socialMedia?: string;
  website?: string;
  whyTeach: string;
}

export const instructorsAPI = {
  apply: (data: InstructorApplicationData) => {
    return apiClient.post('/instructors/apply', data);
  },
};
