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
    updateMe(user: any, updateUserDto: UpdateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
    updateMyProfile(user: any, updateProfileDto: UpdateProfileDto): Promise<any>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<import("./entities/user.entity").User, "password">>;
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=users.controller.d.ts.map