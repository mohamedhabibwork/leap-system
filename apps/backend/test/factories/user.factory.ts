import { faker } from '@faker-js/faker';

export interface CreateUserFactoryData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  roleId?: number;
  statusId?: number;
  preferredLanguage?: string;
  timezone?: string;
  passwordHash?: string;
  isActive?: boolean;
  isOnline?: boolean;
}

export function createUserFactory(overrides?: Partial<CreateUserFactoryData>): CreateUserFactoryData {
  return {
    email: faker.internet.email().toLowerCase(),
    username: faker.internet.username().toLowerCase().substring(0, 50),
    firstName: faker.person.firstName().substring(0, 100),
    lastName: faker.person.lastName().substring(0, 100),
    phone: faker.phone.number().substring(0, 20),
    bio: faker.lorem.paragraph(),
    avatarUrl: faker.image.avatar(),
    resumeUrl: faker.internet.url(),
    preferredLanguage: faker.helpers.arrayElement(['en', 'ar']),
    timezone: faker.location.timeZone(),
    isActive: true,
    isOnline: faker.datatype.boolean(),
    ...overrides,
  };
}

export function createUsersFactory(count: number, overrides?: Partial<CreateUserFactoryData>): CreateUserFactoryData[] {
  return Array.from({ length: count }, () => createUserFactory(overrides));
}
