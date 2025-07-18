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
exports.JWTStrategy = void 0;
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const passport_jwt_1 = require("passport-jwt");
const admin_service_1 = require("../../modules/admin/admin.service");
let JWTStrategy = class JWTStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    administratorService;
    constructor(configService, administratorService) {
        const JWTSecret = configService.get("JWT_SECRET");
        if (!JWTSecret) {
            throw new Error("JWT_SECRET is not defined in the environment variables.");
        }
        const strategyOptions = {
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWTSecret,
        };
        super(strategyOptions);
        this.configService = configService;
        this.administratorService = administratorService;
    }
    async validate(payload) {
        const { sub: id, email } = payload;
        try {
            const administrator = await this.administratorService.findOne(id);
            if (!administrator) {
                throw new common_1.UnauthorizedException("Administrator not found");
            }
            return {
                id: administrator.id,
                sub: administrator.id,
                email: administrator.email,
                first_name: administrator.first_name,
                last_name: administrator.last_name,
            };
        }
        catch (error) {
            console.error("JWT validation error: ", error);
            throw new common_1.UnauthorizedException("Invalid token");
        }
    }
    ;
};
exports.JWTStrategy = JWTStrategy;
exports.JWTStrategy = JWTStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        admin_service_1.AdministratorService])
], JWTStrategy);
;
//# sourceMappingURL=jwt.strategy.js.map