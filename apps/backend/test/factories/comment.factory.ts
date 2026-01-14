import { faker } from '@faker-js/faker';

export interface CreateCommentFactoryData {
  userId?: number;
  commentableType?: string;
  commentableId?: number;
  parentCommentId?: number;
  content?: string;
}

export function createCommentFactory(overrides?: Partial<CreateCommentFactoryData>): CreateCommentFactoryData {
  return {
    commentableType: faker.helpers.arrayElement(['post', 'course', 'event', 'job', 'lesson']),
    content: faker.lorem.paragraph(),
    ...overrides,
  };
}

export interface CreateCommentReactionFactoryData {
  commentId?: number;
  userId?: number;
  reactionTypeId?: number;
}

export function createCommentReactionFactory(overrides?: Partial<CreateCommentReactionFactoryData>): CreateCommentReactionFactoryData {
  return {
    ...overrides,
  };
}

export function createCommentsFactory(count: number, overrides?: Partial<CreateCommentFactoryData>): CreateCommentFactoryData[] {
  return Array.from({ length: count }, () => createCommentFactory(overrides));
}
