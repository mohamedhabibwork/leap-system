import { drizzle } from 'drizzle-orm/node-postgres';
import { courseCategories } from '@leap-lms/database';
import { eq } from 'drizzle-orm';
import { createDatabasePool } from './db-helper';

export async function seedCourseCategories() {
  const pool = createDatabasePool();
  const db = drizzle(pool);

  console.log('🌱 Seeding course categories...');

  // Helper function to upsert category
  const upsertCategory = async (categoryData: any, isTopLevel: boolean = false, isFirstCategory: boolean = false, tempParentId: number | null = null, dbPool: any = null) => {
    const [existing] = await db
      .select()
      .from(courseCategories)
      .where(eq(courseCategories.slug, categoryData.slug))
      .limit(1);

    if (existing) {
      const needsUpdate =
        existing.nameEn !== categoryData.nameEn ||
        existing.nameAr !== categoryData.nameAr ||
        existing.descriptionEn !== categoryData.descriptionEn ||
        existing.descriptionAr !== categoryData.descriptionAr ||
        existing.parentId !== categoryData.parentId ||
        existing.displayOrder !== categoryData.displayOrder ||
        existing.isActive !== categoryData.isActive;

      if (needsUpdate) {
        await db
          .update(courseCategories)
          .set(categoryData )
          .where(eq(courseCategories.id, existing.id));
        console.log(`  ↻ Updated category: ${categoryData.nameEn}`);
      }
      return existing;
    } else {
      try {
        // For top-level categories, we need to provide a temporary parentId
        // We'll update it to self-reference after insertion
        const insertData: any = { ...categoryData };
        
        // ALWAYS ensure parentId is set - never null or undefined
        if (insertData.parentId === null || insertData.parentId === undefined) {
          if (isTopLevel) {
            // For top-level categories, check if there are existing categories
            const [anyCategory] = await db
              .select({ id: courseCategories.id })
              .from(courseCategories)
              .limit(1);
            
            if (anyCategory) {
              insertData.parentId = anyCategory.id;
            } else if (isFirstCategory) {
              // This is the first category - will be handled in catch block with raw SQL
              // We'll try to insert with a placeholder that will fail FK, then catch and handle
              insertData.parentId = 1; // Temporary, will fail FK and be caught
            } else {
              insertData.parentId = tempParentId || 1;
            }
          } else {
            // For subcategories, parentId should be provided via tempParentId
            insertData.parentId = tempParentId || 1;
          }
        }
        
        // Double-check: parentId must never be null/undefined at this point
        if (insertData.parentId === null || insertData.parentId === undefined) {
          throw new Error(`parentId cannot be null for category: ${insertData.slug}`);
        }
        
        let [newCategory] = await db.insert(courseCategories).values(insertData ).returning();
        
        // For top-level categories, update parentId to self-reference
        if (isTopLevel) {
          // Always update to self-reference for top-level categories
          await db
            .update(courseCategories)
            .set({ parentId: newCategory.id } )
            .where(eq(courseCategories.id, newCategory.id));
          newCategory.parentId = newCategory.id;
        }
        
        console.log(`  ✓ Created category: ${categoryData.nameEn}`);
        return newCategory;
      } catch (error: any) {
        // Handle foreign key constraint error for first category
        if ((error.code === '23503' || error.code === '23502') && isFirstCategory) {
          // This is the first category and FK/NOT NULL constraint failed
          // Use a workaround: Create a function that inserts and updates in one go
          // OR use a transaction with constraint deferral
          try {
            const client = await (dbPool || pool).connect();
            try {
              // First, ensure the constraint is deferrable (do this outside transaction)
              // Check if constraint exists and is deferrable
              const constraintCheck = await client.query(`
                SELECT conname, condeferrable 
                FROM pg_constraint 
                WHERE conname = 'course_categories_parent_id_course_categories_id_fk'
              `);
              
              if (constraintCheck.rows.length === 0 || !constraintCheck.rows[0].condeferrable) {
                // Constraint doesn't exist or is not deferrable, make it deferrable
                console.log('  ℹ️  Making constraint deferrable...');
                await client.query(`
                  ALTER TABLE course_categories 
                  DROP CONSTRAINT IF EXISTS course_categories_parent_id_course_categories_id_fk
                `);
                await client.query(`
                  ALTER TABLE course_categories 
                  ADD CONSTRAINT course_categories_parent_id_course_categories_id_fk 
                  FOREIGN KEY (parent_id) REFERENCES course_categories(id) 
                  DEFERRABLE INITIALLY DEFERRED
                `);
              }
              
              // Now start transaction and use deferred constraint
              await client.query('BEGIN');
              
              // Set constraint as deferred for this transaction
              await client.query('SET CONSTRAINTS course_categories_parent_id_course_categories_id_fk DEFERRED');
              
              // Insert with a temporary parent_id (will be updated to self-reference)
              // Since constraint is deferred, we can use any value and update it before commit
              const insertResult = await client.query(`
                INSERT INTO course_categories (
                  name_en, name_ar, slug, description_en, description_ar,
                  parent_id, display_order, "isActive", "isDeleted"
                ) 
                VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $8)
                RETURNING id
              `, [
                categoryData.nameEn,
                categoryData.nameAr || null,
                categoryData.slug,
                categoryData.descriptionEn || null,
                categoryData.descriptionAr || null,
                categoryData.displayOrder || 0,
                categoryData.isActive !== false,
                false
              ]);
              
              if (insertResult.rows && insertResult.rows[0]) {
                const newId = insertResult.rows[0].id;
                // Update to self-reference
                await client.query(
                  `UPDATE course_categories SET parent_id = $1 WHERE id = $1`,
                  [newId]
                );
                
                await client.query('COMMIT');
                
                // Fetch the complete category
                const [created] = await db
                  .select()
                  .from(courseCategories)
                  .where(eq(courseCategories.id, newId))
                  .limit(1);
                
                if (created) {
                  console.log(`  ✓ Created category: ${categoryData.nameEn}`);
                  return created;
                }
              }
            } catch (txError: any) {
              try {
                await client.query('ROLLBACK');
              } catch (rollbackError: any) {
                // Ignore rollback errors
              }
              throw txError;
            } finally {
              client.release();
            }
          } catch (sqlError: any) {
            // If all approaches fail, provide helpful error with solution
            throw new Error(
              `Cannot insert first category: parent_id has NOT NULL + FK constraint.\n` +
              `Solution: Run this SQL to make the constraint DEFERRABLE:\n` +
              `ALTER TABLE course_categories DROP CONSTRAINT course_categories_parent_id_course_categories_id_fk;\n` +
              `ALTER TABLE course_categories ADD CONSTRAINT course_categories_parent_id_course_categories_id_fk ` +
              `FOREIGN KEY (parent_id) REFERENCES course_categories(id) DEFERRABLE INITIALLY DEFERRED;\n\n` +
              `Original error: ${error.message}`
            );
          }
        }
        
        // Handle other FK constraint errors
        if (error.code === '23503' && isTopLevel) {
          // Foreign key constraint failed - try with existing category as parent
          try {
            const [anyCategory] = await db
              .select({ id: courseCategories.id })
              .from(courseCategories)
              .limit(1);
            
            if (anyCategory) {
              const insertData = { ...categoryData, parentId: anyCategory.id };
              let [newCategory] = await db.insert(courseCategories).values(insertData ).returning();
              
              // Update to self-reference
              await db
                .update(courseCategories)
                .set({ parentId: newCategory.id } )
                .where(eq(courseCategories.id, newCategory.id));
              newCategory.parentId = newCategory.id;
              
              console.log(`  ✓ Created category: ${categoryData.nameEn}`);
              return newCategory;
            }
          } catch (retryError: any) {
            // If still fails, rethrow original error
            throw error;
          }
        }
        
        if (error.code === '23505') {
          const [existing] = await db
            .select()
            .from(courseCategories)
            .where(eq(courseCategories.slug, categoryData.slug))
            .limit(1);
          
          if (existing) {
            await db
              .update(courseCategories)
              .set(categoryData )
              .where(eq(courseCategories.id, existing.id));
            return existing;
          }
        }
        throw error;
      }
    }
  };

  const categoriesToSeed = [
    {
      nameEn: 'Web Development',
      nameAr: 'تطوير الويب',
      slug: 'web-development',
      descriptionEn: 'Learn modern web development technologies',
      descriptionAr: 'تعلم تقنيات تطوير الويب الحديثة',
      parentId: null,
      displayOrder: 1,
      isActive: true,
    },
    {
      nameEn: 'Mobile Development',
      nameAr: 'تطوير الهواتف المحمولة',
      slug: 'mobile-development',
      descriptionEn: 'Build mobile applications for iOS and Android',
      descriptionAr: 'بناء تطبيقات الهواتف المحمولة لنظامي iOS و Android',
      parentId: null,
      displayOrder: 2,
      isActive: true,
    },
    {
      nameEn: 'Data Science',
      nameAr: 'علوم البيانات',
      slug: 'data-science',
      descriptionEn: 'Master data analysis and machine learning',
      descriptionAr: 'إتقان تحليل البيانات والتعلم الآلي',
      parentId: null,
      displayOrder: 3,
      isActive: true,
    },
    {
      nameEn: 'Design',
      nameAr: 'التصميم',
      slug: 'design',
      descriptionEn: 'Learn UI/UX design and graphic design',
      descriptionAr: 'تعلم تصميم واجهات المستخدم والتصميم الجرافيكي',
      parentId: null,
      displayOrder: 4,
      isActive: true,
    },
    {
      nameEn: 'Business',
      nameAr: 'الأعمال',
      slug: 'business',
      descriptionEn: 'Business and entrepreneurship courses',
      descriptionAr: 'دورات الأعمال وريادة الأعمال',
      parentId: null,
      displayOrder: 5,
      isActive: true,
    },
    {
      nameEn: 'Frontend Development',
      nameAr: 'تطوير الواجهة الأمامية',
      slug: 'frontend-development',
      descriptionEn: 'React, Vue, Angular and modern frontend frameworks',
      descriptionAr: 'React و Vue و Angular وأطر عمل الواجهة الأمامية الحديثة',
      parentId: null, // Will be set after parent is created
      displayOrder: 1,
      isActive: true,
    },
    {
      nameEn: 'Backend Development',
      nameAr: 'تطوير الواجهة الخلفية',
      slug: 'backend-development',
      descriptionEn: 'Node.js, Python, Java and server-side development',
      descriptionAr: 'Node.js و Python و Java وتطوير جانب الخادم',
      parentId: null, // Will be set after parent is created
      displayOrder: 2,
      isActive: true,
    },
  ];

  // Check if table is empty (for first category handling)
  const existingCategories = await db
    .select()
    .from(courseCategories)
    .limit(1);
  
  const isTableEmpty = existingCategories.length === 0;
  let tempParentId: number | null = null;

  // If table is empty, we need to handle the first category specially
  // Since parent_id is NOT NULL with FK constraint, we'll use a workaround
  if (isTableEmpty) {
    // We'll handle the first category in the upsertCategory function
    // It will use raw SQL with a transaction workaround
    tempParentId = null;
  } else {
    tempParentId = existingCategories[0].id;
  }

  // First, seed top-level categories
  // For top-level categories, we'll use self-reference (parentId = id) since parent_id is NOT NULL
  const topLevelCategories = categoriesToSeed.filter(cat => !cat.slug.includes('-'));
  const createdCategories: any[] = [];

  for (let i = 0; i < topLevelCategories.length; i++) {
    const categoryData = topLevelCategories[i];
    // Remove parentId from data - it will be set during insertion
    const { parentId, ...dataWithoutParent } = categoryData;
    
    // For the very first category if table was empty, use temp parent
    const isFirstCategory = isTableEmpty && i === 0;
    // Always pass a parentId - upsertCategory will handle it
    const category = await upsertCategory(
      { ...dataWithoutParent, parentId: tempParentId || undefined }, 
      true, 
      isFirstCategory, 
      tempParentId, 
      pool
    );
    createdCategories.push(category);
  }


  // Then seed subcategories with parent references
  const subcategories = categoriesToSeed.filter(cat => cat.slug.includes('-'));
  for (const categoryData of subcategories) {
    // Find parent category
    let parentId = null;
    if (categoryData.slug === 'frontend-development' || categoryData.slug === 'backend-development') {
      const webDevCategory = createdCategories.find(c => c.slug === 'web-development');
      if (webDevCategory) {
        parentId = webDevCategory.id;
      }
    }
    
    // If no parent found, use self-reference as fallback
    if (!parentId) {
      console.log(`  ⚠️  No parent found for ${categoryData.slug}, using self-reference`);
      // Will be handled in upsertCategory
    }
    
    const category = await upsertCategory({ ...categoryData, parentId: parentId || undefined }, !parentId, false, tempParentId, pool);
    createdCategories.push(category);
  }

  console.log('✅ Course categories seeded successfully!');
  await pool.end();
}
