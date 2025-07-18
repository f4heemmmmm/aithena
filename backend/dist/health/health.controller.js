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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const health_service_1 = require("./health.service");
let HealthController = class HealthController {
    healthService;
    constructor(healthService) {
        this.healthService = healthService;
    }
    async getHealth() {
        const health = await this.healthService.getSystemHealth();
        return {
            status_code: common_1.HttpStatus.OK,
            message: "System health check completed",
            data: health
        };
    }
    async getDatabaseHealth() {
        const dbHealth = await this.healthService.getDatabaseHealth();
        return {
            status_code: common_1.HttpStatus.OK,
            message: "Database health check completed",
            data: dbHealth
        };
    }
    async getBlogHealth() {
        const blogHealth = await this.healthService.getBlogHealth();
        return {
            status_code: common_1.HttpStatus.OK,
            message: "Blog service health check completed",
            data: blogHealth
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get overall system health" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "System health status" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)("database"),
    (0, swagger_1.ApiOperation)({ summary: "Get database health" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Database health status" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDatabaseHealth", null);
__decorate([
    (0, common_1.Get)("blog"),
    (0, swagger_1.ApiOperation)({ summary: "Get blog service health" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Blog service health status" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getBlogHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)("Health"),
    (0, common_1.Controller)("health"),
    __metadata("design:paramtypes", [health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map