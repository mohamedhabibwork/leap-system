import { faker } from '@faker-js/faker';

export interface CreateCourseFactoryData {
  titleEn?: string;
  titleAr?: string;
  slug?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  objectivesEn?: string;
  objectivesAr?: string;
  requirementsEn?: string;
  requirementsAr?: string;
  instructorId?: number;
  categoryId?: number;
  statusId?: number;
  enrollmentTypeId?: number;
  price?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  durationHours?: number;
  maxStudents?: number;
  allowSubscriptionAccess?: boolean;
  allowPurchase?: boolean;
  publishDate?: Date;
  isFeatured?: boolean;
}

export function createCourseFactory(overrides?: Partial<CreateCourseFactoryData>): CreateCourseFactoryData {
  const title = faker.lorem.words(5);
  return {
    titleEn: title.substring(0, 255),
    titleAr: faker.lorem.words(5).substring(0, 255),
    slug: faker.helpers.slugify(title).toLowerCase().substring(0, 255),
    descriptionEn: faker.lorem.paragraphs(3),
    descriptionAr: faker.lorem.paragraphs(3),
    objectivesEn: faker.lorem.paragraph(),
    objectivesAr: faker.lorem.paragraph(),
    requirementsEn: faker.lorem.paragraph(),
    requirementsAr: faker.lorem.paragraph(),
    price: faker.commerce.price({ min: 0, max: 1000, dec: 2 }),
    thumbnailUrl: faker.image.url(),
    videoUrl: faker.internet.url(),
    durationHours: faker.number.int({ min: 1, max: 100 }),
    maxStudents: faker.number.int({ min: 10, max: 500 }),
    allowSubscriptionAccess: true,
    allowPurchase: true,
    publishDate: faker.date.future(),
    isFeatured: faker.datatype.boolean(),
    ...overrides,
  };
}

export interface CreateCourseSectionFactoryData {
  courseId?: number;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  displayOrder?: number;
}

export function createCourseSectionFactory(overrides?: Partial<CreateCourseSectionFactoryData>): CreateCourseSectionFactoryData {
  return {
    titleEn: faker.lorem.words(4).substring(0, 255),
    titleAr: faker.lorem.words(4).substring(0, 255),
    descriptionEn: faker.lorem.paragraph(),
    descriptionAr: faker.lorem.paragraph(),
    displayOrder: faker.number.int({ min: 0, max: 100 }),
    ...overrides,
  };
}

export interface CreateLessonFactoryData {
  sectionId?: number;
  contentTypeId?: number;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  contentEn?: string;
  contentAr?: string;
  videoUrl?: string;
  attachmentUrl?: string;
  durationMinutes?: number;
  displayOrder?: number;
  isPreview?: boolean;
}

export function createLessonFactory(overrides?: Partial<CreateLessonFactoryData>): CreateLessonFactoryData {
  return {
    titleEn: faker.lorem.words(4).substring(0, 255),
    titleAr: faker.lorem.words(4).substring(0, 255),
    descriptionEn: faker.lorem.paragraph(),
    descriptionAr: faker.lorem.paragraph(),
    contentEn: faker.lorem.paragraphs(2),
    contentAr: faker.lorem.paragraphs(2),
    videoUrl: faker.internet.url(),
    attachmentUrl: faker.internet.url(),
    durationMinutes: faker.number.int({ min: 5, max: 120 }),
    displayOrder: faker.number.int({ min: 0, max: 100 }),
    isPreview: faker.datatype.boolean(),
    ...overrides,
  };
}

export function createCoursesFactory(count: number, overrides?: Partial<CreateCourseFactoryData>): CreateCourseFactoryData[] {
  return Array.from({ length: count }, () => createCourseFactory(overrides));
}
