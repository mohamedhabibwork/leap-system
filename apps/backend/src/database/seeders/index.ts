import { seedLookups } from './01-lookups.seeder';
import { seedUsers } from './02-users.seeder';
import { seedPlans } from './03-plans.seeder';
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
    console.log('🌱 Seeded lookups');
    await seedUsers();
    console.log('🌱 Seeded users');
    await seedPlans();
    console.log('🌱 Seeded plans');
    await seedCourses();
    console.log('🌱 Seeded courses');
    await seedCourseCategories();
    console.log('🌱 Seeded course categories');
    await seedCourseSections();
    console.log('🌱 Seeded course sections');
    await seedCourseLessons();
    console.log('🌱 Seeded course lessons');
    await seedCourseResources();
    console.log('🌱 Seeded course resources');
    await seedCourseEnrollments();
    console.log('🌱 Seeded course enrollments');
    await seedCourseEnrollmentTypes();
    console.log('🌱 Seeded course enrollment types');
    await seedCourseEnrollmentStatuses();
    console.log('🌱 Seeded course enrollment statuses');

    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  }
}

// Run seeders
runSeeders();
