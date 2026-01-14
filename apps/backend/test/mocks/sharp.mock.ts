// Mock for sharp to avoid native module issues in Jest
const createSharpInstance = (input?: any) => {
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

const sharp = createSharpInstance as any;
// Add static metadata method
sharp.metadata = jest.fn().mockResolvedValue({ width: 100, height: 100, format: 'jpeg' });

// Support both CommonJS and ES modules
module.exports = sharp;
module.exports.default = sharp;
export default sharp;
