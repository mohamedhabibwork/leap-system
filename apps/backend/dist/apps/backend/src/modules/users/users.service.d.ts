import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
import { User } from './entities/user.entity';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class UsersService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>>;
    findAll(page?: number, limit?: number): Promise<{
        data: Omit<User, 'password'>[];
        total: number;
    }>;
    findOne(id: number): Promise<Omit<User, 'password'>>;
    findByEmail(email: string): Promise<any>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>>;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<any>;
    updateOnlineStatus(id: number, isOnline: boolean): Promise<void>;
    remove(id: number): Promise<void>;
    getUserProfile(id: number): Promise<any>;
    searchUsers(query: string, roleFilter?: string, page?: number, limit?: number): Promise<any>;
    getUserDirectory(page?: number, limit?: number, roleFilter?: string): Promise<any>;
    uploadAvatar(userId: number, avatarUrl: string): Promise<any>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<any>;
    getEnrolledStudents(instructorId: number, courseId?: number): Promise<any>;
    blockUser(id: number, reason?: string): Promise<any>;
    unblockUser(id: number): Promise<any>;
    banUser(id: number, reason: string): Promise<any>;
    updateUserRole(id: number, roleId: number): Promise<any>;
    getUserStats(): Promise<any>;
    getUserActivity(id: number): Promise<any>;
}
//# sourceMappingURL=users.service.d.ts.map