import { drizzle } from 'drizzle-orm/node-postgres';
import { plans, planFeatures } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedPlans() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding subscription plans...');

  // Helper function to upsert plan
  const upsertPlan = async (planData: any) => {
    // Try to find by nameEn (assuming it's unique enough)
    const [existing] = await db
      .select()
      .from(plans)
      .where(eq(plans.nameEn, planData.nameEn))
      .limit(1);

    if (existing) {
      // Update if different
      const needsUpdate =
        existing.nameAr !== planData.nameAr ||
        existing.descriptionEn !== planData.descriptionEn ||
        existing.descriptionAr !== planData.descriptionAr ||
        existing.priceMonthly !== planData.priceMonthly ||
        existing.priceQuarterly !== planData.priceQuarterly ||
        existing.priceAnnual !== planData.priceAnnual ||
        existing.maxCourses !== planData.maxCourses ||
        existing.isActive !== planData.isActive ||
        existing.displayOrder !== planData.displayOrder;

      if (needsUpdate) {
        await db
          .update(plans)
          .set(planData as any)
          .where(eq(plans.id, existing.id));
        console.log(`  ↻ Updated plan: ${planData.nameEn}`);
      }
      return existing;
    } else {
      try {
        const [newPlan] = await db.insert(plans).values(planData as any).returning();
        console.log(`  ✓ Created plan: ${planData.nameEn}`);
        return newPlan;
      } catch (error: any) {
        // Handle duplicate key error
        if (error.code === '23505') {
          const [existing] = await db
            .select()
            .from(plans)
            .where(eq(plans.nameEn, planData.nameEn))
            .limit(1);
          
          if (existing) {
            await db
              .update(plans)
              .set(planData as any)
              .where(eq(plans.id, existing.id));
            return existing;
          }
        }
        throw error;
      }
    }
  };

  const plansToSeed = [
    {
      nameEn: 'Free',
      nameAr: 'مجاني',
      descriptionEn: 'Basic access to learning platform',
      descriptionAr: 'وصول أساسي لمنصة التعلم',
      priceMonthly: '0.00',
      priceQuarterly: '0.00',
      priceAnnual: '0.00',
      maxCourses: 5,
      isActive: true,
      displayOrder: 1,
    },
    {
      nameEn: 'Basic',
      nameAr: 'أساسي',
      descriptionEn: 'Perfect for individual learners',
      descriptionAr: 'مثالي للمتعلمين الأفراد',
      priceMonthly: '9.99',
      priceQuarterly: '26.99',
      priceAnnual: '99.99',
      maxCourses: 50,
      isActive: true,
      displayOrder: 2,
    },
    {
      nameEn: 'Premium',
      nameAr: 'متقدم',
      descriptionEn: 'Unlimited access for serious learners',
      descriptionAr: 'وصول غير محدود للمتعلمين الجادين',
      priceMonthly: '29.99',
      priceQuarterly: '79.99',
      priceAnnual: '299.99',
      maxCourses: null, // unlimited
      isActive: true,
      displayOrder: 3,
    },
    {
      nameEn: 'Enterprise',
      nameAr: 'مؤسسات',
      descriptionEn: 'For organizations and teams',
      descriptionAr: 'للمؤسسات والفرق',
      priceMonthly: '99.99',
      priceQuarterly: '269.99',
      priceAnnual: '999.99',
      maxCourses: null, // unlimited
      isActive: true,
      displayOrder: 4,
    },
  ];

  // Upsert all plans
  const createdPlans = [];
  for (const planData of plansToSeed) {
    const plan = await upsertPlan(planData);
    createdPlans.push(plan);
  }

  // Plan Features (featureId should reference lookup IDs - using placeholder value 1 for now)
  const defaultFeatureId = 1;
  
  // Helper to upsert plan features
  const upsertPlanFeature = async (featureData: any) => {
    try {
      await db.insert(planFeatures).values(featureData as any);
    } catch (error: any) {
      // Ignore duplicate errors for features - they're idempotent
      if (error.code === '23505') {
        // Feature already exists, skip
        return;
      }
      throw error;
    }
  };

  const featuresToSeed = [
    // Free Plan Features
    { planId: createdPlans[0].id, featureId: defaultFeatureId, featureValue: '5 courses' },
    { planId: createdPlans[0].id, featureId: defaultFeatureId, featureValue: '1GB storage' },
    
    // Basic Plan Features
    { planId: createdPlans[1].id, featureId: defaultFeatureId, featureValue: '50 courses' },
    { planId: createdPlans[1].id, featureId: defaultFeatureId, featureValue: '10GB storage' },
    { planId: createdPlans[1].id, featureId: defaultFeatureId, featureValue: 'Certificates' },
    
    // Premium Plan Features
    { planId: createdPlans[2].id, featureId: defaultFeatureId, featureValue: 'Unlimited courses' },
    { planId: createdPlans[2].id, featureId: defaultFeatureId, featureValue: '100GB storage' },
    { planId: createdPlans[2].id, featureId: defaultFeatureId, featureValue: 'Certificates' },
    { planId: createdPlans[2].id, featureId: defaultFeatureId, featureValue: 'Priority support' },
    
    // Enterprise Plan Features
    { planId: createdPlans[3].id, featureId: defaultFeatureId, featureValue: 'Unlimited courses' },
    { planId: createdPlans[3].id, featureId: defaultFeatureId, featureValue: 'Unlimited storage' },
    { planId: createdPlans[3].id, featureId: defaultFeatureId, featureValue: 'Certificates' },
    { planId: createdPlans[3].id, featureId: defaultFeatureId, featureValue: 'API access' },
    { planId: createdPlans[3].id, featureId: defaultFeatureId, featureValue: 'Dedicated support' },
  ];

  // Upsert all plan features
  for (const featureData of featuresToSeed) {
    await upsertPlanFeature(featureData);
  }

  console.log('✅ Plans seeded successfully!');
  await pool.end();
}
