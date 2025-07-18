import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { LoginAdministratorDTO } from "../admin/admin.dto";
import { AdministratorService } from "../admin/admin.service";
export interface JWTPayload {
    sub: string;
    email: string;
    first_name: string;
    last_name: string;
    iat?: number;
    exp?: number;
}
export interface LoginResult {
    access_token: string;
    refresh_token: string;
    administrator: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
    };
}
export interface RefreshResult {
    access_token: string;
}
export declare class AuthService {
    private readonly administratorService;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(administratorService: AdministratorService, jwtService: JwtService, configService: ConfigService);
    login(loginDTO: LoginAdministratorDTO): Promise<LoginResult>;
    refreshToken(refreshToken: string): Promise<RefreshResult>;
    validateUser(email: string, password: string): Promise<import("../admin/admin.entity").Administrator | null>;
}
