import { useMutation } from '@tanstack/react-query';
import { useState, useRef, useCallback } from 'react';
import apiClient from '../api/client';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_CONCURRENT_UPLOADS = 3;
const MAX_RETRIES = 3;

interface UploadOptions {
  file: File;
  folder: string;
  onProgress?: (progress: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

interface UploadState {
  progress: number;
  isUploading: boolean;
  isPaused: boolean;
  error: Error | null;
}

/**
 * Enhanced file upload hook with chunking, retry, and cancel support
 */
export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    isUploading: false,
    isPaused: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadChunk = async (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    fileId: string,
    retries = 0
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileId', fileId);

      await apiClient.post('/media/upload-chunk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortControllerRef.current?.signal,
      });
    } catch (error) {
      if (retries < MAX_RETRIES) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
        return uploadChunk(chunk, chunkIndex, totalChunks, fileId, retries + 1);
      }
      throw error;
    }
  };

  const uploadLargeFile = async ({ file, folder, onProgress, onChunkComplete }: UploadOptions) => {
    const fileId = `${Date.now()}-${file.name}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const chunks: Blob[] = [];

    // Split file into chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push(file.slice(start, end));
    }

    // Upload chunks with concurrency limit
    let uploadedChunks = 0;
    const uploadQueue = [...Array(totalChunks).keys()];

    const uploadWorker = async (): Promise<void> => {
      while (uploadQueue.length > 0) {
        const chunkIndex = uploadQueue.shift();
        if (chunkIndex === undefined) break;

        await uploadChunk(chunks[chunkIndex], chunkIndex, totalChunks, fileId);

        uploadedChunks++;
        const progress = (uploadedChunks / totalChunks) * 100;
        
        setUploadState((prev) => ({ ...prev, progress }));
        onProgress?.(progress);
        onChunkComplete?.(chunkIndex, totalChunks);
      }
    };

    // Create concurrent workers
    const workers = Array(MAX_CONCURRENT_UPLOADS)
      .fill(null)
      .map(() => uploadWorker());

    await Promise.all(workers);

    // Finalize upload
    const response = await apiClient.post('/media/finalize-upload', {
      fileId,
      filename: file.name,
      folder,
      totalChunks,
    });

    return response.data;
  };

  const upload = async (options: UploadOptions) => {
    setUploadState({
      progress: 0,
      isUploading: true,
      isPaused: false,
      error: null,
    });

    abortControllerRef.current = new AbortController();

    try {
      let result;

      // Use chunked upload for files larger than CHUNK_SIZE
      if (options.file.size > CHUNK_SIZE) {
        result = await uploadLargeFile(options);
      } else {
        // Regular upload for small files
        const formData = new FormData();
        formData.append('file', options.file);
        formData.append('folder', options.folder);

        const response = await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: abortControllerRef.current.signal,
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? (progressEvent.loaded / progressEvent.total) * 100
              : 0;
            setUploadState((prev) => ({ ...prev, progress }));
            options.onProgress?.(progress);
          },
        });

        result = response.data;
      }

      setUploadState((prev) => ({
        ...prev,
        progress: 100,
        isUploading: false,
      }));

      return result;
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
      isPaused: false,
      error: new Error('Upload cancelled'),
    }));
  }, []);

  const pause = useCallback(() => {
    setUploadState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setUploadState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  return {
    upload,
    cancel,
    pause,
    resume,
    ...uploadState,
  };
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: async (key: string) => {
      return apiClient.delete(`/media/${key}`);
    },
  });
}

/**
 * Hook for batch file uploads
 */
export function useBatchUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

  const uploadFiles = async (files: File[], folder: string) => {
    const uploadPromises = files.map(async (file) => {
      const fileId = `${Date.now()}-${file.name}`;
      
      setUploads((prev) => new Map(prev).set(fileId, {
        progress: 0,
        isUploading: true,
        isPaused: false,
        error: null,
      }));

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? (progressEvent.loaded / progressEvent.total) * 100
              : 0;
            
            setUploads((prev) => {
              const newUploads = new Map(prev);
              const state = newUploads.get(fileId);
              if (state) {
                newUploads.set(fileId, { ...state, progress });
              }
              return newUploads;
            });
          },
        });

        setUploads((prev) => {
          const newUploads = new Map(prev);
          const state = newUploads.get(fileId);
          if (state) {
            newUploads.set(fileId, { ...state, isUploading: false, progress: 100 });
          }
          return newUploads;
        });

        return response.data;
      } catch (error) {
        setUploads((prev) => {
          const newUploads = new Map(prev);
          const state = newUploads.get(fileId);
          if (state) {
            newUploads.set(fileId, { ...state, isUploading: false, error: error as Error });
          }
          return newUploads;
        });
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  return {
    uploadFiles,
    uploads,
  };
}
