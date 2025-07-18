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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const auth_service_1 = require("./auth.service");
const common_1 = require("@nestjs/common");
const admin_dto_1 = require("../admin/admin.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    onModuleInit() {
        console.log("AuthController loaded successfully");
        console.log("Available routes:");
        console.log(" - POST /api/auth/login");
        console.log(" - POST /api/auth/refresh");
        console.log(" - GET /api/auth/profile");
        console.log(" - GET /api/auth/verify");
    }
    async login(loginDTO) {
        console.log("Login attempt for: ", loginDTO.email);
        const result = await this.authService.login(loginDTO);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Login successful",
            data: result,
        };
    }
    async refreshToken(refreshDTO) {
        const result = await this.authService.refreshToken(refreshDTO.refresh_token);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Token refreshed successfully",
            data: result,
        };
    }
    async getProfile(req) {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Profile retrieved successfully",
            data: req.user,
        };
    }
    async verifyToken(req) {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Token is valid",
            data: {
                user: req.user,
                isValid: true,
            }
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("login"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.LoginAdministratorDTO]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("refresh"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)("profile"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JWTAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)("verify"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JWTAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
;
//# sourceMappingURL=auth.controller.js.map