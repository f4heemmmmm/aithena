import { AuthService, LoginResult, RefreshResult } from "./auth.service";
import { OnModuleInit } from "@nestjs/common";
import { LoginAdministratorDTO } from "../admin/admin.dto";
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}
export interface RefreshTokenDTO {
    refresh_token: string;
}
export declare class AuthController implements OnModuleInit {
    private readonly authService;
    constructor(authService: AuthService);
    onModuleInit(): void;
    login(loginDTO: LoginAdministratorDTO): Promise<ApiResponse<LoginResult>>;
    refreshToken(refreshDTO: RefreshTokenDTO): Promise<ApiResponse<RefreshResult>>;
    getProfile(req: any): Promise<ApiResponse<any>>;
    verifyToken(req: any): Promise<ApiResponse<any>>;
}
