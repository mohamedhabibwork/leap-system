import { faker } from '@faker-js/faker';

export interface CreateJobFactoryData {
  titleEn?: string;
  titleAr?: string;
  slug?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  requirementsEn?: string;
  requirementsAr?: string;
  responsibilitiesEn?: string;
  responsibilitiesAr?: string;
  jobTypeId?: number;
  experienceLevelId?: number;
  statusId?: number;
  location?: string;
  salaryRange?: string;
  postedBy?: number;
  companyId?: number;
  deadline?: Date;
  isFeatured?: boolean;
}

export function createJobFactory(overrides?: Partial<CreateJobFactoryData>): CreateJobFactoryData {
  const title = faker.person.jobTitle();
  return {
    titleEn: title.substring(0, 255),
    titleAr: faker.person.jobTitle().substring(0, 255),
    slug: faker.helpers.slugify(title).toLowerCase().substring(0, 255),
    descriptionEn: faker.lorem.paragraphs(3),
    descriptionAr: faker.lorem.paragraphs(3),
    requirementsEn: faker.lorem.paragraphs(2),
    requirementsAr: faker.lorem.paragraphs(2),
    responsibilitiesEn: faker.lorem.paragraphs(2),
    responsibilitiesAr: faker.lorem.paragraphs(2),
    location: faker.location.city().substring(0, 255),
    salaryRange: `${faker.number.int({ min: 20000, max: 50000 })} - ${faker.number.int({ min: 50000, max: 150000 })}`,
    deadline: faker.date.future(),
    isFeatured: faker.datatype.boolean(),
    ...overrides,
  };
}

export interface CreateJobApplicationFactoryData {
  jobId?: number;
  userId?: number;
  statusId?: number;
  coverLetter?: string;
  resumeUrl?: string;
  notes?: string;
  reviewedBy?: number;
  reviewedAt?: Date;
  appliedAt?: Date;
}

export function createJobApplicationFactory(overrides?: Partial<CreateJobApplicationFactoryData>): CreateJobApplicationFactoryData {
  return {
    coverLetter: faker.lorem.paragraphs(2),
    resumeUrl: faker.internet.url(),
    notes: faker.lorem.sentence(),
    appliedAt: faker.date.recent(),
    ...overrides,
  };
}

export function createJobsFactory(count: number, overrides?: Partial<CreateJobFactoryData>): CreateJobFactoryData[] {
  return Array.from({ length: count }, () => createJobFactory(overrides));
}
