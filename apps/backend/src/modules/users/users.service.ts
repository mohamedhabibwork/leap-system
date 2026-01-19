import { Injectable, NotFoundException, ConflictException, Inject, BadRequestException, Logger } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { eq, and, sql, or, like, desc } from 'drizzle-orm';
// Import userFollows and lookupTypes from database package
import { users, enrollments, courses, userProfiles, lookups, lookupTypes } from '@leap-lms/database';
// @ts-ignore - userFollows should be exported but TypeScript can't find it
// This is a workaround until the database package is rebuilt
import { userFollows } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{
    id: number;
    uuid: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    roleId: number;
    preferredLanguage: string | null;
    timezone: string | null;
    isActive: boolean;
    isOnline: boolean;
    emailVerifiedAt: Date | null;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
  }> {
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

    // Get default role and status from lookups (default to user role and active status)
    const roleCode = createUserDto.role || 'user';
    const [roleLookup] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .where(eq(lookups.code, roleCode))
      .limit(1);
    
    const [statusLookup] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .where(eq(lookups.code, 'active'))
      .limit(1);

    const roleId = roleLookup?.id || 3; // Default to user role if not found
    const statusId = statusLookup?.id || 1; // Default to active status if not found

    // Insert user
    const result = await this.db
      .insert(users)
      .values({
        email: createUserDto.email,
        username: createUserDto.email.split('@')[0],
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName || '',
        lastName: createUserDto.lastName || '',
        phone: createUserDto.phone || '',
        timezone: createUserDto.timezone || 'UTC',
        roleId,
        statusId,
        preferredLanguage: createUserDto.language || 'en',
        isActive: true,
        isDeleted: false,
      } as InferInsertModel<typeof users>)
      .returning();
    
    const newUser = Array.isArray(result) ? result[0] : result;

    // Create user profile
    await this.db.insert(userProfiles).values({
      userId: newUser.id,
    } as InferInsertModel<typeof userProfiles>);

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword ;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ 
    data: Array<{
      id: number;
      uuid: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      avatarUrl: string | null;
      roleId: number;
      preferredLanguage: string | null;
      timezone: string | null;
      isActive: boolean;
      isOnline: boolean;
      emailVerifiedAt: Date | null;
      lastSeenAt: Date | null;
      createdAt: Date;
      updatedAt: Date | null;
    }>;
    total: number;
  }> {
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

    return { data: data , total: totalCount };
  }

  async findOne(id: number): Promise<{
    id: number;
    uuid: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    roleId: number;
    preferredLanguage: string | null;
    timezone: string | null;
    isActive: boolean;
    isOnline: boolean;
    emailVerifiedAt: Date | null;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
  }> {
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

    return user;
  }

  async findByEmail(email: string): Promise<InferSelectModel<typeof users> | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isDeleted, false)))
      .limit(1);

    return user || null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<{
    id: number;
    uuid: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    roleId: number;
    preferredLanguage: string | null;
    timezone: string | null;
    isActive: boolean;
    isOnline: boolean;
    emailVerifiedAt: Date | null;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
  }> {
    const user = await this.findOne(id);

    const updateData: Partial<InferSelectModel<typeof users>> = {
      ...updateUserDto,
      updatedAt: new Date(),
    };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const [updatedUser] = await this.db
      .update(users)
      .set(updateData as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, id))
      .returning();

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword ;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<InferSelectModel<typeof userProfiles>> {
    const user = await this.findOne(userId);

    const [profile] = await this.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      // Create profile if doesn't exist
      const [newProfile] = await this.db
        .insert(userProfiles)
        .values({
          userId: userId,
          bio: updateProfileDto.bio,
          dateOfBirth: updateProfileDto.date_of_birth,
          gender: updateProfileDto.gender,
          location: updateProfileDto.location,
          website: updateProfileDto.website,
          avatar: updateProfileDto.avatar,
          coverPhoto: updateProfileDto.cover_photo,
        } as InferInsertModel<typeof userProfiles>)
        .returning();
      return newProfile;
    }

    const [updatedProfile] = await this.db
      .update(userProfiles)
      .set({
        bio: updateProfileDto.bio,
        dateOfBirth: updateProfileDto.date_of_birth,
        gender: updateProfileDto.gender,
        location: updateProfileDto.location,
        website: updateProfileDto.website,
        avatar: updateProfileDto.avatar,
        coverPhoto: updateProfileDto.cover_photo,
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof userProfiles>>)
      .where(eq(userProfiles.userId, userId))
      .returning();

    return updatedProfile;
  }

  async updateOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    await this.db
      .update(users)
      .set({
        isOnline: isOnline,
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, id));
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    // Soft delete
    await this.db
      .update(users)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, id));
  }

  async getUserProfile(id: number): Promise<Pick<InferSelectModel<typeof users>, 'id' | 'uuid' | 'username' | 'firstName' | 'lastName' | 'bio' | 'avatarUrl' | 'roleId' | 'createdAt' | 'isOnline' | 'lastSeenAt'> & { followerCount: number; followingCount: number }> {
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
        followerCount: (users as any).followerCount,
        followingCount: (users as any).followingCount,
      })
      .from(users)
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async searchUsers(query: string, roleFilter?: string, page: number = 1, limit: number = 20): Promise<{
    data: Array<Pick<InferSelectModel<typeof users>, 'id' | 'uuid' | 'username' | 'firstName' | 'lastName' | 'bio' | 'avatarUrl' | 'roleId' | 'isOnline' | 'lastSeenAt'> & { followerCount: number; followingCount: number }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
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
          followerCount: (users as any).followerCount,
          followingCount: (users as any).followingCount,
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

  async getUserDirectory(page: number = 1, limit: number = 20, roleFilter?: string): Promise<{
    data: Array<Pick<InferSelectModel<typeof users>, 'id' | 'uuid' | 'username' | 'firstName' | 'lastName' | 'bio' | 'avatarUrl' | 'roleId' | 'isOnline' | 'lastSeenAt'> & { followerCount: number; followingCount: number }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.searchUsers('', roleFilter, page, limit);
  }

  async uploadAvatar(userId: number, avatarUrl: string): Promise<{
    id: number;
    uuid: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    roleId: number;
    preferredLanguage: string | null;
    timezone: string | null;
    isActive: boolean;
    isOnline: boolean;
    emailVerifiedAt: Date | null;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
  }> {
    await this.db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, userId));

    return this.findOne(userId);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
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
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, userId));

    return { message: 'Password changed successfully' };
  }

  async getEnrolledStudents(instructorId: number, courseId?: number): Promise<{
    data: Array<{
      id: number;
      uuid: string;
      username: string | null;
      email: string;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
      enrolledAt: Date | null;
      courseId: number;
      courseName: string | null;
      progress: string | null;
    }>;
    total: number;
  }> {
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

  async blockUser(id: number, reason?: string): Promise<{ message: string; reason?: string }> {
    await this.db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, id));

    return { message: 'User blocked successfully', reason };
  }

  async unblockUser(id: number): Promise<{ message: string }> {
    await this.db
      .update(users)
      .set({
        isActive: true,
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, id));

    return { message: 'User unblocked successfully' };
  }

  async banUser(id: number, reason: string): Promise<{ message: string; reason: string }> {
    await this.db
      .update(users)
      .set({
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, id));

    return { message: 'User banned successfully', reason };
  }

  async updateUserRole(id: number, roleId: number): Promise<{
    id: number;
    uuid: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    roleId: number;
    preferredLanguage: string | null;
    timezone: string | null;
    isActive: boolean;
    isOnline: boolean;
    emailVerifiedAt: Date | null;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
  }> {
    await this.db
      .update(users)
      .set({
        roleId,
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof users>>)
      .where(eq(users.id, id));

    return this.findOne(id);
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    blocked: number;
    deleted: number;
  }> {
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

  async getUserActivity(id: number): Promise<{
    userId: number;
    lastLoginAt: Date | null;
    isOnline: boolean | null;
  }> {
    const user = await this.findOne(id);

    // Return basic activity info
    return {
      userId: user.id,
      lastLoginAt: user.lastSeenAt,
      isOnline: user.isOnline ?? null,
      // Additional activity data can be added here
    };
  }

  async followUser(followingId: number, followerId: number) {
    try {
      // Prevent self-follow
      if (followingId === followerId) {
        return { success: false, message: 'Cannot follow yourself' };
      }

      // Check if user exists
      const [targetUser] = await this.db
        .select()
        .from(users)
        .where(and(eq(users.id, followingId), eq(users.isDeleted, false)))
        .limit(1);

      if (!targetUser) {
        throw new NotFoundException(`User with ID ${followingId} not found`);
      }

      // Check if already following
      const [existing] = await this.db
        .select()
        .from(userFollows)
        .where(and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId),
          eq(userFollows.isDeleted, false)
        ))
        .limit(1);

      if (existing) {
        return { success: false, message: 'Already following this user' };
      }

      // Create follow record
      await this.db.insert(userFollows).values({
        followerId,
        followingId,
        isDeleted: false,
      } as InferInsertModel<typeof userFollows>);

      // Update follower count for the user being followed
      await this.db
        .update(users)
        .set({ followerCount: sql`${(users as any).followerCount} + 1` } as any)
        .where(eq(users.id, followingId));

      // Update following count for the follower
      await this.db
        .update(users)
        .set({ followingCount: sql`${(users as any).followingCount} + 1` } as any)
        .where(eq(users.id, followerId));

      // Get follower info
      const [follower] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, followerId))
        .limit(1);

      if (!follower) {
        this.logger.warn(`Follower user ${followerId} not found`);
        return { success: true, message: 'Followed user successfully' };
      }

      const followerName = `${follower.firstName || ''} ${follower.lastName || ''}`.trim() || follower.username;

      // Get notification type ID
      const [notifType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'notification_type'),
          eq(lookups.code, 'user_follow')
        ))
        .limit(1);

      // Notify the user being followed
      if (notifType) {
        await this.notificationsService.sendMultiChannelNotification({
          userId: followingId,
          notificationTypeId: notifType.id,
          title: 'New Follower',
          message: `${followerName} started following you`,
          linkUrl: `/users/${followerId}`,
          channels: ['database', 'websocket'],
        });

        this.logger.log(`User follow notification sent to user ${followingId}`);
      }

      return { success: true, message: 'Followed user successfully' };
    } catch (error) {
      this.logger.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followingId: number, followerId: number) {
    try {
      // Check if follow relationship exists
      const [existing] = await this.db
        .select()
        .from(userFollows)
        .where(and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId),
          eq(userFollows.isDeleted, false)
        ))
        .limit(1);

      if (!existing) {
        return { success: false, message: 'Not following this user' };
      }

      // Soft delete the follow record
      await this.db
        .update(userFollows)
        .set({ isDeleted: true, deletedAt: new Date() })
        .where(eq(userFollows.id, existing.id));

      // Decrement follower count for the user being unfollowed
      await this.db
        .update(users)
        .set({ followerCount: sql`GREATEST(${(users as any).followerCount} - 1, 0)` } as any)
        .where(eq(users.id, followingId));

      // Decrement following count for the follower
      await this.db
        .update(users)
        .set({ followingCount: sql`GREATEST(${(users as any).followingCount} - 1, 0)` } as any)
        .where(eq(users.id, followerId));

      this.logger.log(`User ${followerId} unfollowed user ${followingId}`);

      return { success: true, message: 'Unfollowed user successfully' };
    } catch (error) {
      this.logger.error('Error unfollowing user:', error);
      throw error;
    }
  }
}
