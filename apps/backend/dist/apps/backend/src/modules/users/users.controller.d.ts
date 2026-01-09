import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
    findAll(page?: number, limit?: number): Promise<{
        data: Omit<import("./entities/user.entity").User, "password">[];
        total: number;
    }>;
    getMe(user: any): Promise<Omit<import("./entities/user.entity").User, "password">>;
    findOne(id: number): Promise<Omit<import("./entities/user.entity").User, "password">>;
    getUserProfile(id: number): Promise<any>;
    updateMe(user: any, updateUserDto: UpdateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
    updateMyProfile(user: any, updateProfileDto: UpdateProfileDto): Promise<any>;
    updateProfile(user: any, updateProfileDto: UpdateProfileDto): Promise<any>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
    blockUser(id: number, body: {
        reason?: string;
    }): Promise<any>;
    unblockUser(id: number): Promise<any>;
    banUser(id: number, body: {
        reason: string;
    }): Promise<any>;
    updateUserRole(id: number, body: {
        roleId: number;
    }): Promise<any>;
    getUserStats(): Promise<any>;
    getUserActivity(id: number): Promise<any>;
    remove(id: number): Promise<void>;
    getUserDirectory(page?: number, limit?: number, role?: string): Promise<any>;
    searchUsers(query: string, page?: number, limit?: number, role?: string): Promise<any>;
    uploadAvatar(user: any, file: Express.Multer.File): Promise<any>;
    changePassword(user: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<any>;
    getEnrolledStudents(instructorId: number, courseId?: number): Promise<any>;
}
//# sourceMappingURL=users.controller.d.ts.map