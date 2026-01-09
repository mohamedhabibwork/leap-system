import { seedLookups } from './01-lookups.seeder';
import { seedUsers } from './02-users.seeder';
import { seedPlans } from './03-plans.seeder';
import { seedKeycloakRoles } from './04-keycloak-roles.seeder';
import { seedKeycloakUsers } from './05-keycloak-users.seeder';

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

async function runKeycloakSeeders() {
  console.log('🚀 Starting Keycloak seeding...\n');
  
  try {
    await seedKeycloakRoles();
    await seedKeycloakUsers();
    
    console.log('\n✅ Keycloak seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running Keycloak seeders:', error);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--keycloak-roles')) {
  seedKeycloakRoles().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else if (args.includes('--keycloak-users')) {
  seedKeycloakUsers().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else if (args.includes('--keycloak-all')) {
  runKeycloakSeeders();
} else {
  runSeeders();
}
