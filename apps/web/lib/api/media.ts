import { apiClient } from './client';

export interface UploadResponse {
  url: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const mediaAPI = {
  upload: (file: File, folder: string = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    return apiClient.post<UploadResponse>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
