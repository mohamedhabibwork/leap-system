import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            uuid: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            roleId: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            uuid: any;
            email: any;
            username: any;
            firstName: any;
            lastName: any;
            roleId: any;
        };
    }>;
    refresh(body: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    getProfile(userId: number): Promise<any>;
}
//# sourceMappingURL=auth.controller.d.ts.map