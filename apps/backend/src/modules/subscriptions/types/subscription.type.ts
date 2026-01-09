import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Plan {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field()
  nameEn: string;

  @Field({ nullable: true })
  nameAr?: string;

  @Field({ nullable: true })
  descriptionEn?: string;

  @Field({ nullable: true })
  descriptionAr?: string;

  @Field(() => Float, { nullable: true })
  priceMonthly?: number;

  @Field(() => Float, { nullable: true })
  priceQuarterly?: number;

  @Field(() => Float, { nullable: true })
  priceAnnual?: number;

  @Field(() => Int, { nullable: true })
  maxCourses?: number;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  displayOrder: number;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class Subscription {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  planId: number;

  @Field(() => Int)
  statusId: number;

  @Field(() => Int)
  billingCycleId: number;

  @Field(() => Float)
  amountPaid: number;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field()
  autoRenew: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PaymentHistory {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field(() => Int, { nullable: true })
  subscriptionId?: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field({ nullable: true })
  invoiceNumber?: string;

  @Field({ nullable: true })
  invoiceUrl?: string;

  @Field(() => Int)
  statusId: number;

  @Field()
  paymentDate: Date;

  @Field()
  createdAt: Date;
}
