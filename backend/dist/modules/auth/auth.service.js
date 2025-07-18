"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const admin_service_1 = require("../admin/admin.service");
let AuthService = AuthService_1 = class AuthService {
    administratorService;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(administratorService, jwtService, configService) {
        this.administratorService = administratorService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDTO) {
        try {
            this.logger.log(`Login attempt for email: ${loginDTO.email}`);
            const administrator = await this.administratorService.validateLogin(loginDTO.email, loginDTO.password);
            this.logger.log(`Administrator validated: ${administrator.email}`);
            const payload = {
                sub: administrator.id,
                email: administrator.email,
                first_name: administrator.first_name,
                last_name: administrator.last_name,
            };
            const jwtSecret = this.configService.get("JWT_SECRET");
            const jwtRefreshSecret = this.configService.get("JWT_REFRESH_SECRET");
            const jwtExpiresIn = this.configService.get("JWT_EXPIRES_IN") || "24h";
            const jwtRefreshExpiresIn = this.configService.get("JWT_REFRESH_EXPIRES_IN") || "7d";
            if (!jwtSecret || !jwtRefreshSecret) {
                this.logger.error("JWT secrets are not configured properly");
                throw new Error("JWT secrets are not configured properly");
            }
            const accessToken = this.jwtService.sign(payload, {
                secret: jwtSecret,
                expiresIn: jwtExpiresIn,
            });
            const refreshToken = this.jwtService.sign(payload, {
                secret: jwtRefreshSecret,
                expiresIn: jwtRefreshExpiresIn,
            });
            this.logger.log(`Tokens generated for user: ${administrator.email}`);
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                administrator: {
                    id: administrator.id,
                    email: administrator.email,
                    first_name: administrator.first_name,
                    last_name: administrator.last_name,
                }
            };
        }
        catch (error) {
            this.logger.error(`Login failed for email: ${loginDTO.email}`, error);
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const jwtSecret = this.configService.get("JWT_SECRET");
            const jwtRefreshSecret = this.configService.get("JWT_REFRESH_SECRET");
            const jwtExpiresIn = this.configService.get("JWT_EXPIRES_IN") || "24h";
            if (!jwtRefreshSecret || !jwtSecret) {
                throw new common_1.UnauthorizedException("JWT configuration error");
            }
            const payload = this.jwtService.verify(refreshToken, {
                secret: jwtRefreshSecret,
            });
            const administrator = await this.administratorService.findOne(payload.sub);
            if (!administrator) {
                throw new common_1.UnauthorizedException("Administrator not found");
            }
            const newPayload = {
                sub: administrator.id,
                email: administrator.email,
                first_name: administrator.first_name,
                last_name: administrator.last_name,
            };
            const newAccessToken = this.jwtService.sign(newPayload, {
                secret: jwtSecret,
                expiresIn: jwtExpiresIn,
            });
            return {
                access_token: newAccessToken,
            };
        }
        catch (error) {
            this.logger.error("Token refresh failed", error);
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
    }
    async validateUser(email, password) {
        try {
            const administrator = await this.administratorService.validateLogin(email, password);
            return administrator;
        }
        catch (error) {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_service_1.AdministratorService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map