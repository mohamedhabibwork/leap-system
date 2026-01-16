import { apiClient } from './client';
import { AxiosRequestConfig } from 'axios';

export interface UploadResponse {
  url: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface UploadOptions {
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void;
  signal?: AbortSignal;
}

export const mediaAPI = {
  upload: (file: File, folder: string = 'general', options?: UploadOptions) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (options?.onUploadProgress) {
      config.onUploadProgress = options.onUploadProgress;
    }

    if (options?.signal) {
      config.signal = options.signal;
    }
    
    return apiClient.post<UploadResponse>('/media/upload', formData, config);
  },
};
