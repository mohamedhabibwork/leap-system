import { Injectable, NotFoundException, ConflictException, Inject, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { eq, and, sql, or, like, desc } from 'drizzle-orm';
import { users, enrollments, courses } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user already exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, createUserDto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Insert user
    const [newUser] = await this.db
      .insert(users)
      .values({
        email: createUserDto.email,
        username: createUserDto.email.split('@')[0],
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName || '',
        lastName: createUserDto.lastName || '',
        phone: createUserDto.phone || '',
        timezone: createUserDto.timezone || 'UTC',
      } as any)
      .returning();

    // Create user profile
    // TODO: Re-enable when userProfiles schema is available
    // await this.db.insert(userProfiles).values({
    //   userId: newUser.id,
    // });

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword as any;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Omit<User, 'password'>[]; total: number }> {
    const offset = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      this.db
        .select({
          id: users.id,
          uuid: users.uuid,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          avatarUrl: users.avatarUrl,
          roleId: users.roleId,
          preferredLanguage: users.preferredLanguage,
          timezone: users.timezone,
          isActive: users.isActive,
          isOnline: users.isOnline,
          emailVerifiedAt: users.emailVerifiedAt,
          lastSeenAt: users.lastSeenAt,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.isDeleted, false))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isDeleted, false))
        .then(result => Number(result[0].count)),
    ]);

    return { data: data as any, total: totalCount };
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const [user] = await this.db
      .select({
        id: users.id,
        uuid: users.uuid,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        roleId: users.roleId,
        preferredLanguage: users.preferredLanguage,
        timezone: users.timezone,
        isActive: users.isActive,
        isOnline: users.isOnline,
        emailVerifiedAt: users.emailVerifiedAt,
        lastSeenAt: users.lastSeenAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user as any;
  }

  async findByEmail(email: string): Promise<any> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isDeleted, false)))
      .limit(1);

    return user || null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.findOne(id);

    const updateData: any = {
      ...updateUserDto,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const [updatedUser] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as any;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<any> {
    const user = await this.findOne(userId);

    // TODO: Re-enable when userProfiles schema is available
    // const [profile] = await this.db
    //   .select()
    //   .from(userProfiles)
    //   .where(eq(userProfiles.userId, userId))
    //   .limit(1);

    // if (!profile) {
    //   // Create profile if doesn't exist
    //   const [newProfile] = await this.db
    //     .insert(userProfiles)
    //     .values({
    //       userId: userId,
    //       bio: updateProfileDto.bio,
    //       date_of_birth: updateProfileDto.date_of_birth,
    //       gender: updateProfileDto.gender,
    //       location: updateProfileDto.location,
    //       website: updateProfileDto.website,
    //     })
    //     .returning();
    //   return newProfile;
    // }

    // const [updatedProfile] = await this.db
    //   .update(userProfiles)
    //   .set({
    //     ...updateProfileDto,
    //     updatedAt: sql`CURRENT_TIMESTAMP`,
    //   })
    //   .where(eq(userProfiles.userId, userId))
    //   .returning();

    // return updatedProfile;
    
    // Temporary: Update user directly
    const [updated] = await this.db
      .update(users)
      .set({
        bio: updateProfileDto.bio,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async updateOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    await this.db
      .update(users)
      .set({
        isOnline: isOnline,
        lastSeenAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, id));
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete
    await this.db
      .update(users)
      .set({
        isDeleted: true,
        deletedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, id));
  }

  async getUserProfile(id: number): Promise<any> {
    const [user] = await this.db
      .select({
        id: users.id,
        uuid: users.uuid,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
        roleId: users.roleId,
        createdAt: users.createdAt,
        isOnline: users.isOnline,
        lastSeenAt: users.lastSeenAt,
      })
      .from(users)
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async searchUsers(query: string, roleFilter?: string, page: number = 1, limit: number = 20): Promise<any> {
    const offset = (page - 1) * limit;
    const conditions = [eq(users.isDeleted, false)];

    if (query) {
      conditions.push(
        or(
          like(users.firstName, `%${query}%`),
          like(users.lastName, `%${query}%`),
          like(users.username, `%${query}%`),
          like(users.email, `%${query}%`)
        )
      );
    }

    if (roleFilter) {
      conditions.push(eq(users.roleId, parseInt(roleFilter)));
    }

    const [data, totalCount] = await Promise.all([
      this.db
        .select({
          id: users.id,
          uuid: users.uuid,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          bio: users.bio,
          avatarUrl: users.avatarUrl,
          roleId: users.roleId,
          isOnline: users.isOnline,
          lastSeenAt: users.lastSeenAt,
        })
        .from(users)
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(...conditions))
        .then(result => Number(result[0].count)),
    ]);

    return {
      data,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getUserDirectory(page: number = 1, limit: number = 20, roleFilter?: string): Promise<any> {
    return this.searchUsers('', roleFilter, page, limit);
  }

  async uploadAvatar(userId: number, avatarUrl: string): Promise<any> {
    await this.db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, userId));

    return this.findOne(userId);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<any> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.db
      .update(users)
      .set({
        passwordHash,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, userId));

    return { message: 'Password changed successfully' };
  }

  async getEnrolledStudents(instructorId: number, courseId?: number): Promise<any> {
    // First verify the user is an instructor
    const instructor = await this.findOne(instructorId);
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    // Get courses taught by this instructor
    const instructorCourses = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.instructorId, instructorId));

    if (instructorCourses.length === 0) {
      return { data: [], total: 0 };
    }

    const courseIds = instructorCourses.map(c => c.id);

    // Build query conditions
    const conditions = [eq(users.isDeleted, false)];
    
    if (courseId) {
      conditions.push(eq(enrollments.courseId, courseId));
    }

    // Get enrolled students
    const studentsData = await this.db
      .select({
        id: users.id,
        uuid: users.uuid,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
        enrolledAt: enrollments.enrolledAt,
        courseId: enrollments.courseId,
        courseName: courses.titleEn,
        progress: enrollments.progressPercentage,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(
          ...conditions,
          courseId ? eq(enrollments.courseId, courseId) : sql`${enrollments.courseId} IN ${courseIds}`
        )
      )
      .orderBy(desc(enrollments.enrolledAt));

    return {
      data: studentsData,
      total: studentsData.length,
    };
  }

  async blockUser(id: number, reason?: string): Promise<any> {
    await this.db
      .update(users)
      .set({
        isActive: false,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, id));

    return { message: 'User blocked successfully', reason };
  }

  async unblockUser(id: number): Promise<any> {
    await this.db
      .update(users)
      .set({
        isActive: true,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, id));

    return { message: 'User unblocked successfully' };
  }

  async banUser(id: number, reason: string): Promise<any> {
    await this.db
      .update(users)
      .set({
        isActive: false,
        isDeleted: true,
        deletedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, id));

    return { message: 'User banned successfully', reason };
  }

  async updateUserRole(id: number, roleId: number): Promise<any> {
    await this.db
      .update(users)
      .set({
        roleId,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(users.id, id));

    return this.findOne(id);
  }

  async getUserStats(): Promise<any> {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where ${users.isActive} = true and ${users.isDeleted} = false)`,
        blocked: sql<number>`count(*) filter (where ${users.isActive} = false and ${users.isDeleted} = false)`,
        deleted: sql<number>`count(*) filter (where ${users.isDeleted} = true)`,
      })
      .from(users);

    return stats;
  }

  async getUserActivity(id: number): Promise<any> {
    const user = await this.findOne(id);

    // Return basic activity info
    return {
      userId: user.id,
      lastLoginAt: (user as any).last_seen_at || (user as any).lastSeenAt,
      isOnline: user.isOnline,
      // Additional activity data can be added here
    };
  }
}
