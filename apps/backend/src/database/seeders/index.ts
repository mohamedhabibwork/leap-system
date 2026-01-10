import { seedLookups } from './01-lookups.seeder';
import { seedUsers } from './02-users.seeder';
import { seedPlans } from './03-plans.seeder';
import { seedKeycloakRoles } from './04-keycloak-roles.seeder';
import { seedKeycloakUsers } from './05-keycloak-users.seeder';
import { seedCourses } from './06-courses.seeder';
import { seedCourseCategories } from './07-course-categories.seeder';
import { seedCourseSections } from './08-course-sections.seeder';
import { seedCourseLessons } from './09-course-lessons.seeder';
import { seedCourseResources } from './10-course-resources.seeder';
import { seedCourseEnrollments } from './11-course-enrollments.seeder';
import { seedCourseEnrollmentTypes } from './12-course-enrollment-types.seeder';
import { seedCourseEnrollmentStatuses } from './13-course-enrollment-statuses.seeder';

async function runSeeders() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    await seedLookups();
    await seedUsers();
    await seedPlans();
    await seedCourses();
    await seedCourseCategories();
    await seedCourseSections();
    await seedCourseLessons();
    await seedCourseResources();
    await seedCourseEnrollments();
    await seedCourseEnrollmentTypes();
    await seedCourseEnrollmentStatuses();

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

if (args.includes('--keycloak-roles' )) {
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
  runSeeders();
} else {
  runSeeders();
}
