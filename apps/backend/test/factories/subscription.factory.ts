import { faker } from '@faker-js/faker';

export interface CreatePlanFactoryData {
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  priceMonthly?: string;
  priceQuarterly?: string;
  priceAnnual?: string;
  maxCourses?: number;
  isActive?: boolean;
  displayOrder?: number;
}

export function createPlanFactory(overrides?: Partial<CreatePlanFactoryData>): CreatePlanFactoryData {
  const planName = faker.helpers.arrayElement(['Basic', 'Premium', 'Enterprise', 'Pro', 'Starter']);
  return {
    nameEn: `${planName} Plan`,
    nameAr: `خطة ${planName}`,
    descriptionEn: faker.lorem.paragraph(),
    descriptionAr: faker.lorem.paragraph(),
    priceMonthly: faker.commerce.price({ min: 9, max: 99, dec: 2 }),
    priceQuarterly: faker.commerce.price({ min: 25, max: 250, dec: 2 }),
    priceAnnual: faker.commerce.price({ min: 80, max: 800, dec: 2 }),
    maxCourses: faker.number.int({ min: 5, max: 100 }),
    isActive: true,
    displayOrder: faker.number.int({ min: 0, max: 10 }),
    ...overrides,
  };
}

export interface CreateSubscriptionFactoryData {
  userId?: number;
  planId?: number;
  statusId?: number;
  billingCycleId?: number;
  amountPaid?: string;
  startDate?: Date;
  endDate?: Date;
  cancelledAt?: Date;
  autoRenew?: boolean;
}

export function createSubscriptionFactory(overrides?: Partial<CreateSubscriptionFactoryData>): CreateSubscriptionFactoryData {
  const startDate = faker.date.recent();
  return {
    amountPaid: faker.commerce.price({ min: 9, max: 999, dec: 2 }),
    startDate,
    endDate: faker.date.future({ refDate: startDate }),
    autoRenew: faker.datatype.boolean(),
    ...overrides,
  };
}

export interface CreatePaymentHistoryFactoryData {
  subscriptionId?: number;
  userId?: number;
  amount?: string;
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  statusId?: number;
  paymentDate?: Date;
}

export function createPaymentHistoryFactory(overrides?: Partial<CreatePaymentHistoryFactoryData>): CreatePaymentHistoryFactoryData {
  return {
    amount: faker.commerce.price({ min: 9, max: 999, dec: 2 }),
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'SAR', 'AED']),
    paymentMethod: faker.helpers.arrayElement(['credit_card', 'paypal', 'bank_transfer', 'stripe']),
    transactionId: faker.string.alphanumeric(20),
    invoiceNumber: `INV-${faker.string.alphanumeric(10).toUpperCase()}`,
    invoiceUrl: faker.internet.url(),
    paymentDate: faker.date.recent(),
    ...overrides,
  };
}

export function createPlansFactory(count: number, overrides?: Partial<CreatePlanFactoryData>): CreatePlanFactoryData[] {
  return Array.from({ length: count }, () => createPlanFactory(overrides));
}
