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
exports.AdministratorController = void 0;
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const admin_dto_1 = require("./admin.dto");
let AdministratorController = class AdministratorController {
    administratorService;
    constructor(administratorService) {
        this.administratorService = administratorService;
    }
    async create(createAdministratorDTO) {
        const administrator = await this.administratorService.create(createAdministratorDTO);
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: "Administrator created successfully",
            data: administrator,
        };
    }
    async findAll() {
        const administrators = await this.administratorService.findAll();
        const count = await this.administratorService.count();
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Administrators retrieved successfully",
            data: administrators,
            count,
        };
    }
    async findOne(id) {
        const administrator = await this.administratorService.findOne(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Administrator retrieved successfully",
            data: administrator
        };
    }
    async update(id, updateAdministratorDTO) {
        const administrator = await this.administratorService.update(id, updateAdministratorDTO);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Administrator updated successfully",
            data: administrator
        };
    }
    async remove(id) {
        const result = await this.administratorService.remove(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: result.message
        };
    }
    async getProfile(id) {
        const administrator = await this.administratorService.findOne(id);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Administrator profile received successfully",
            data: administrator,
        };
    }
};
exports.AdministratorController = AdministratorController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateAdministratorDTO]),
    __metadata("design:returntype", Promise)
], AdministratorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdministratorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdministratorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateAdministratorDTO]),
    __metadata("design:returntype", Promise)
], AdministratorController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdministratorController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)("profile/:id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdministratorController.prototype, "getProfile", null);
exports.AdministratorController = AdministratorController = __decorate([
    (0, common_1.Controller)("administrators"),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JWTAuthGuard),
    __metadata("design:paramtypes", [admin_service_1.AdministratorService])
], AdministratorController);
//# sourceMappingURL=admin.controller.js.map