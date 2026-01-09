import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { eq, and, sql } from 'drizzle-orm';
import { users } from '@leap-lms/database';
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
}
