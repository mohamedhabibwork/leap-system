import { faker } from '@faker-js/faker';

export interface CreateMediaFactoryData {
  uploadedBy?: number;
  mediableType?: string;
  mediableId?: number;
  providerId?: number;
  fileName?: string;
  originalName?: string;
  filePath?: string;
  fileType?: string;
  mimeType?: string;
  fileSize?: number;
  altText?: string;
  metadata?: Record<string, any>;
  isTemporary?: boolean;
  tempExpiresAt?: Date;
}

export function createMediaFactory(overrides?: Partial<CreateMediaFactoryData>): CreateMediaFactoryData {
  const fileName = faker.system.fileName();
  const fileTypes = ['image', 'video', 'document', 'audio'];
  const fileType = faker.helpers.arrayElement(fileTypes);
  const mimeTypes: Record<string, string[]> = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  };

  return {
    fileName: fileName.substring(0, 255),
    originalName: fileName.substring(0, 255),
    filePath: faker.system.filePath(),
    fileType,
    mimeType: faker.helpers.arrayElement(mimeTypes[fileType] || ['application/octet-stream']),
    fileSize: faker.number.int({ min: 1024, max: 10485760 }), // 1KB to 10MB
    altText: faker.lorem.sentence(),
    metadata: {
      width: fileType === 'image' ? faker.number.int({ min: 100, max: 4000 }) : undefined,
      height: fileType === 'image' ? faker.number.int({ min: 100, max: 4000 }) : undefined,
      duration: fileType === 'video' || fileType === 'audio' ? faker.number.int({ min: 10, max: 3600 }) : undefined,
    },
    isTemporary: false,
    ...overrides,
  };
}

export function createMediaFactoryArray(count: number, overrides?: Partial<CreateMediaFactoryData>): CreateMediaFactoryData[] {
  return Array.from({ length: count }, () => createMediaFactory(overrides));
}
