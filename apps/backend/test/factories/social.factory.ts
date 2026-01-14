import { faker } from '@faker-js/faker';

export interface CreatePostFactoryData {
  userId?: number;
  postTypeId?: number;
  content?: string;
  visibilityId?: number;
  groupId?: number;
  pageId?: number;
  metadata?: Record<string, any>;
  settings?: Record<string, any>;
  publishedAt?: Date;
}

export function createPostFactory(overrides?: Partial<CreatePostFactoryData>): CreatePostFactoryData {
  return {
    content: faker.lorem.paragraphs(2),
    metadata: {
      tags: faker.lorem.words(3).split(' '),
      location: faker.location.city(),
    },
    settings: {
      allowComments: true,
      allowShares: true,
    },
    publishedAt: faker.date.recent(),
    ...overrides,
  };
}

export interface CreateGroupFactoryData {
  name?: string;
  slug?: string;
  description?: string;
  privacyTypeId?: number;
  coverImageUrl?: string;
  createdBy?: number;
}

export function createGroupFactory(overrides?: Partial<CreateGroupFactoryData>): CreateGroupFactoryData {
  const name = faker.company.name();
  return {
    name: name.substring(0, 255),
    slug: faker.helpers.slugify(name).toLowerCase().substring(0, 255),
    description: faker.lorem.paragraph(),
    coverImageUrl: faker.image.url(),
    ...overrides,
  };
}

export interface CreatePageFactoryData {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: number;
  coverImageUrl?: string;
  profileImageUrl?: string;
  createdBy?: number;
}

export function createPageFactory(overrides?: Partial<CreatePageFactoryData>): CreatePageFactoryData {
  const name = faker.company.name();
  return {
    name: name.substring(0, 255),
    slug: faker.helpers.slugify(name).toLowerCase().substring(0, 255),
    description: faker.lorem.paragraph(),
    coverImageUrl: faker.image.url(),
    profileImageUrl: faker.image.avatar(),
    ...overrides,
  };
}

export function createPostsFactory(count: number, overrides?: Partial<CreatePostFactoryData>): CreatePostFactoryData[] {
  return Array.from({ length: count }, () => createPostFactory(overrides));
}
