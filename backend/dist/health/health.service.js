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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let HealthService = class HealthService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getSystemHealth() {
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        const timestamp = new Date().toISOString();
        const dbHealth = await this.getDatabaseHealth();
        return {
            status: "OK",
            timestamp,
            uptime: `${Math.floor(uptime / 60)} minutes`,
            memory: {
                used: Math.round(memory.heapUsed / 1024 / 1024) + " MB",
                total: Math.round(memory.heapTotal / 1024 / 1024) + " MB",
                rss: Math.round(memory.rss / 1024 / 1024) + " MB"
            },
            version: process.version,
            database: dbHealth,
            service: "AITHENA Backend"
        };
    }
    async getDatabaseHealth() {
        try {
            await this.dataSource.query("SELECT 1");
            return {
                status: "connected",
                type: this.dataSource.options.type,
                database: this.dataSource.options.database,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: "disconnected",
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    async getBlogHealth() {
        try {
            const blogPostCount = await this.dataSource.query("SELECT COUNT(*) as count FROM blog_posts");
            const publishedCount = await this.dataSource.query("SELECT COUNT(*) as count FROM blog_posts WHERE is_published = true");
            return {
                status: "OK",
                totalPosts: parseInt(blogPostCount[0].count),
                publishedPosts: parseInt(publishedCount[0].count),
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: "error",
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], HealthService);
//# sourceMappingURL=health.service.js.map