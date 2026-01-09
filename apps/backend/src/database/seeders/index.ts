import { seedLookups } from './01-lookups.seeder';
import { seedUsers } from './02-users.seeder';
import { seedPlans } from './03-plans.seeder';

async function runSeeders() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    await seedLookups();
    await seedUsers();
    await seedPlans();
    
    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  }
}

runSeeders();
