import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { plans, planFeatures } from '@leap-lms/database';

export async function seedPlans() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('🌱 Seeding subscription plans...');

  const createdPlans = await db.insert(plans).values([
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
  ]).returning();

  // Plan Features (featureId should reference lookup IDs - using placeholder value 1 for now)
  const defaultFeatureId = 1;
  await db.insert(planFeatures).values([
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
  ]);

  console.log('✅ Plans seeded successfully!');
  await pool.end();
}
