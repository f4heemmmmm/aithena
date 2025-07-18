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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const app_service_1 = require("./app.service");
const app_controller_1 = require("./app.controller");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const blog_module_1 = require("./modules/blog/blog.module");
const contact_module_1 = require("./modules/contact/contact.module");
const admin_module_1 = require("./modules/admin/admin.module");
let AppModule = class AppModule {
    configService;
    constructor(configService) {
        this.configService = configService;
        console.log("🚀 ================================");
        console.log("🚀 AITHENA Backend Starting...");
        console.log("🚀 ================================");
        console.log(`📊 Environment: ${this.configService.get("NODE_ENV")}`);
        console.log(`🗄️  Database: ${this.configService.get("DATABASE_NAME")}`);
        console.log(`🌐 Port: ${this.configService.get("PORT")}`);
        console.log(`🔗 Frontend URL: ${this.configService.get("FRONTEND_URL")}`);
        console.log("📦 Loaded Modules:");
        console.log("   ✅ HealthModule (debugging)");
        console.log("   ✅ ContactModule");
        console.log("   ✅ AdministratorModule");
        console.log("   ✅ AuthModule");
        console.log("   ✅ BlogPostModule (new)");
        console.log("🚀 ================================");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
                cache: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: "postgres",
                    host: configService.get("DATABASE_HOST"),
                    port: configService.get("DATABASE_PORT"),
                    username: configService.get("DATABASE_USERNAME"),
                    password: configService.get("DATABASE_PASSWORD"),
                    database: configService.get("DATABASE_NAME"),
                    entities: [__dirname + "/**/*.entity{.ts,.js}"],
                    synchronize: configService.get("NODE_ENV") === "development",
                    migrations: [__dirname + "/migrations/*{.ts,.js}"],
                    migrationsRun: configService.get("NODE_ENV") !== "development",
                    logging: configService.get("NODE_ENV") === "development",
                }),
                inject: [config_1.ConfigService]
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: "short",
                    ttl: 60000,
                    limit: 10,
                },
                {
                    name: "medium",
                    ttl: 600000,
                    limit: 50,
                },
                {
                    name: "long",
                    ttl: 3600000,
                    limit: 100,
                },
            ]),
            health_module_1.HealthModule,
            contact_module_1.ContactModule,
            admin_module_1.AdministratorModule,
            auth_module_1.AuthModule,
            blog_module_1.BlogPostModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService]
    }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppModule);
;
//# sourceMappingURL=app.module.js.map