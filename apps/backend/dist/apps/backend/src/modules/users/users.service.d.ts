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
}
//# sourceMappingURL=users.service.d.ts.map