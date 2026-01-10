import { eventsAPI } from '@/lib/api/events';
import { apiClient } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Events API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all events', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1' },
        { id: 2, title: 'Event 2' },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockEvents });

      const result = await eventsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/events', { params: undefined });
      expect(result.data).toEqual(mockEvents);
    });

    it('should pass query params', async () => {
      const params = { search: 'test', limit: 10 };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });

      await eventsAPI.getAll(params);

      expect(apiClient.get).toHaveBeenCalledWith('/events', { params });
    });
  });

  describe('register', () => {
    it('should register for an event', async () => {
      const mockRegistration = { id: 1, eventId: 1, status: 'going' };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockRegistration });

      const result = await eventsAPI.register(1, { status: 'going' });

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/register', { status: 'going' });
      expect(result.data).toEqual(mockRegistration);
    });
  });

  describe('delete', () => {
    it('should delete an event', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await eventsAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/events/1');
    });
  });
});
