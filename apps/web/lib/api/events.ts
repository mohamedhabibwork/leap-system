import { apiClient } from './client';

export interface Event {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  locationType: 'online' | 'in-person' | 'hybrid';
  organizerId: number;
  organizer?: {
    id: number;
    name: string;
    avatar?: string;
  };
  categoryId?: number;
  category?: string;
  attendeeCount: number;
  maxAttendees?: number;
  price?: number;
  currency?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isFeatured: boolean;
  registrationStatus?: 'going' | 'interested' | 'maybe' | 'not-going' | null;
  isFavorited?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  status: 'going' | 'interested' | 'maybe' | 'not-going';
  registeredAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateEventDto {
  titleEn: string;
  titleAr?: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  eventTypeId: number;
  statusId: number;
  categoryId?: number;
  startDate: string;
  endDate?: string;
  location?: string;
  timezone?: string;
  meetingUrl?: string;
  capacity?: number;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  locationType?: 'online' | 'in-person' | 'hybrid';
  categoryId?: number;
  maxAttendees?: number;
  price?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  tags?: string[];
}

export interface RegisterEventDto {
  status: 'going' | 'interested' | 'maybe' | 'not-going';
}

/**
 * Events API Service
 * Handles all event-related API calls with authentication
 */
export const eventsAPI = {
  /**
   * Get all events with pagination and filtering
   */
  getAll: (params?: any) => 
    apiClient.get<Event[]>('/events', { params }),
  
  /**
   * Get a single event by ID
   */
  getById: (id: number) => 
    apiClient.get<Event>(`/events/${id}`),
  
  /**
   * Create a new event
   */
  create: (data: CreateEventDto) => 
    apiClient.post<Event>('/events', data),
  
  /**
   * Update an existing event
   */
  update: (id: number, data: UpdateEventDto) => 
    apiClient.patch<Event>(`/events/${id}`, data),
  
  /**
   * Delete an event
   */
  delete: (id: number) => 
    apiClient.delete(`/events/${id}`),
  
  /**
   * Register for an event
   */
  register: (id: number, data: RegisterEventDto) => 
    apiClient.post<EventRegistration>(`/events/${id}/register`, data),
  
  /**
   * Unregister from an event
   */
  unregister: (id: number) => 
    apiClient.delete(`/events/${id}/register`),
  
  /**
   * Update registration status
   */
  updateRegistrationStatus: (id: number, data: RegisterEventDto) => 
    apiClient.patch<EventRegistration>(`/events/${id}/register`, data),
  
  /**
   * Get event registrations
   */
  getRegistrations: (id: number, params?: any) => 
    apiClient.get<EventRegistration[]>(`/events/${id}/registrations`, { params }),
  
  /**
   * Get my events (created by me)
   */
  getMyEvents: (params?: any) => 
    apiClient.get<Event[]>('/events/my-events', { params }),
  
  /**
   * Get my registrations
   */
  getMyRegistrations: (params?: any) => 
    apiClient.get<EventRegistration[]>('/events/my-registrations', { params }),
  
  /**
   * Feature an event
   */
  feature: (id: number) => 
    apiClient.post(`/events/${id}/feature`),
  
  /**
   * Unfeature an event
   */
  unfeature: (id: number) => 
    apiClient.delete(`/events/${id}/feature`),
  
  /**
   * Get event statistics
   */
  getStatistics: () => 
    apiClient.get('/events/statistics'),
  
  /**
   * Export events to CSV
   */
  exportToCsv: (params?: any) => 
    apiClient.get('/events/export/csv', { params, responseType: 'blob' }),
};

export default eventsAPI;
