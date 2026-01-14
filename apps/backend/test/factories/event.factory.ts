import { faker } from '@faker-js/faker';

export interface CreateEventFactoryData {
  titleEn?: string;
  titleAr?: string;
  slug?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  eventTypeId?: number;
  statusId?: number;
  categoryId?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  timezone?: string;
  meetingUrl?: string;
  capacity?: number;
  createdBy?: number;
  bannerUrl?: string;
  isFeatured?: boolean;
}

export function createEventFactory(overrides?: Partial<CreateEventFactoryData>): CreateEventFactoryData {
  const title = faker.lorem.words(5);
  const startDate = faker.date.future();
  return {
    titleEn: title.substring(0, 255),
    titleAr: faker.lorem.words(5).substring(0, 255),
    slug: faker.helpers.slugify(title).toLowerCase().substring(0, 255),
    descriptionEn: faker.lorem.paragraphs(2),
    descriptionAr: faker.lorem.paragraphs(2),
    startDate,
    endDate: faker.date.future({ refDate: startDate }),
    location: faker.location.streetAddress({ useFullAddress: true }).substring(0, 500),
    timezone: faker.location.timeZone(),
    meetingUrl: faker.internet.url(),
    capacity: faker.number.int({ min: 10, max: 1000 }),
    bannerUrl: faker.image.url(),
    isFeatured: faker.datatype.boolean(),
    ...overrides,
  };
}

export interface CreateEventRegistrationFactoryData {
  eventId?: number;
  userId?: number;
  statusId?: number;
  attendanceStatusId?: number;
  registeredAt?: Date;
  attendedAt?: Date;
  cancelledAt?: Date;
}

export function createEventRegistrationFactory(overrides?: Partial<CreateEventRegistrationFactoryData>): CreateEventRegistrationFactoryData {
  return {
    registeredAt: faker.date.recent(),
    ...overrides,
  };
}

export function createEventsFactory(count: number, overrides?: Partial<CreateEventFactoryData>): CreateEventFactoryData[] {
  return Array.from({ length: count }, () => createEventFactory(overrides));
}
