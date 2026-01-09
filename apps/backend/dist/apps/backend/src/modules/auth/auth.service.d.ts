import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from './dto';
export declare class AuthService {
    private db;
    private jwtService;
    private configService;
    constructor(db: any, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<any>;
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
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    getCurrentUser(userId: number): Promise<any>;
}
//# sourceMappingURL=auth.service.d.ts.map