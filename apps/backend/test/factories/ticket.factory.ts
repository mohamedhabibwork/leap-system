import { faker } from '@faker-js/faker';

export interface CreateTicketFactoryData {
  ticketNumber?: string;
  userId?: number;
  categoryId?: number;
  priorityId?: number;
  statusId?: number;
  subject?: string;
  description?: string;
  assignedTo?: number;
  resolvedAt?: Date;
  closedAt?: Date;
}

export function createTicketFactory(overrides?: Partial<CreateTicketFactoryData>): CreateTicketFactoryData {
  return {
    ticketNumber: `TKT-${faker.string.alphanumeric(10).toUpperCase()}`,
    subject: faker.lorem.sentence().substring(0, 500),
    description: faker.lorem.paragraphs(2),
    ...overrides,
  };
}

export interface CreateTicketReplyFactoryData {
  ticketId?: number;
  userId?: number;
  message?: string;
  isInternal?: boolean;
  attachmentUrl?: string;
}

export function createTicketReplyFactory(overrides?: Partial<CreateTicketReplyFactoryData>): CreateTicketReplyFactoryData {
  return {
    message: faker.lorem.paragraph(),
    isInternal: faker.datatype.boolean(),
    attachmentUrl: faker.internet.url(),
    ...overrides,
  };
}

export interface CreateReportFactoryData {
  reportedBy?: number;
  reportTypeId?: number;
  statusId?: number;
  reportableType?: string;
  reportableId?: number;
  reason?: string;
  adminNotes?: string;
  reviewedBy?: number;
  reviewedAt?: Date;
}

export function createReportFactory(overrides?: Partial<CreateReportFactoryData>): CreateReportFactoryData {
  return {
    reportableType: faker.helpers.arrayElement(['post', 'comment', 'user', 'course', 'event']),
    reason: faker.lorem.paragraph(),
    adminNotes: faker.lorem.sentence(),
    ...overrides,
  };
}

export function createTicketsFactory(count: number, overrides?: Partial<CreateTicketFactoryData>): CreateTicketFactoryData[] {
  return Array.from({ length: count }, () => createTicketFactory(overrides));
}
