// Test setup file to ensure mocks are loaded before modules
// This file runs before all tests

// Mock sharp before any imports
jest.mock('sharp', () => {
  const createSharpInstance = () => {
    const instance: any = {
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      png: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data')),
      toFile: jest.fn().mockResolvedValue({}),
      metadata: jest.fn().mockResolvedValue({ width: 100, height: 100, format: 'jpeg' }),
    };
    return instance;
  };

  const sharp = jest.fn(createSharpInstance) as any;
  sharp.metadata = jest.fn().mockResolvedValue({ width: 100, height: 100, format: 'jpeg' });
  return { default: sharp };
}, { virtual: true });
