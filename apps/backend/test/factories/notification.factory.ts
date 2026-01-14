import { faker } from '@faker-js/faker';

export interface CreateNotificationFactoryData {
  userId?: number;
  notificationTypeId?: number;
  title?: string;
  message?: string;
  linkUrl?: string;
  isRead?: boolean;
  readAt?: Date;
}

export function createNotificationFactory(overrides?: Partial<CreateNotificationFactoryData>): CreateNotificationFactoryData {
  return {
    title: faker.lorem.sentence().substring(0, 255),
    message: faker.lorem.paragraph(),
    linkUrl: faker.internet.url(),
    isRead: faker.datatype.boolean(),
    readAt: faker.datatype.boolean() ? faker.date.recent() : undefined,
    ...overrides,
  };
}

export function createNotificationsFactory(count: number, overrides?: Partial<CreateNotificationFactoryData>): CreateNotificationFactoryData[] {
  return Array.from({ length: count }, () => createNotificationFactory(overrides));
}
