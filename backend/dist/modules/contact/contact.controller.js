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
var ContactController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const common_1 = require("@nestjs/common");
const contact_dto_1 = require("./contact.dto");
const contact_service_1 = require("./contact.service");
let ContactController = ContactController_1 = class ContactController {
    contactService;
    configService;
    logger = new common_1.Logger(ContactController_1.name);
    constructor(contactService, configService) {
        this.contactService = contactService;
        this.configService = configService;
    }
    async submitContact(createContactDTO) {
        this.logger.log("Contact form submission received");
        this.logger.log("Data:", JSON.stringify(createContactDTO, null, 2));
        try {
            const result = await this.contactService.sendContactEmail(createContactDTO);
            this.logger.log("Email sent successfully");
            return result;
        }
        catch (error) {
            this.logger.error("Failed to send email:", error.message);
            throw error;
        }
    }
    async checkEmailHealth() {
        this.logger.log("Health check requested");
        const emailReady = await this.contactService.testEmailConnection();
        const config = {
            smtpHost: this.configService.get("SMTP_HOST"),
            smtpPort: this.configService.get("SMTP_PORT"),
            smtpSecure: this.configService.get("SMTP_SECURE", false),
            smtpUser: this.configService.get("SMTP_USER"),
            smtpPassLength: this.configService.get("SMTP_PASS")?.length || 0,
            smtpFrom: this.configService.get("SMTP_FROM"),
            contactEmail: this.configService.get("CONTACT_EMAIL"),
            nodeEnv: this.configService.get("NODE_ENV"),
        };
        this.logger.log("📊 Health check config:", config);
        return {
            status: "OK",
            emailReady,
            config,
            timestamp: new Date().toISOString(),
        };
    }
    async debugEmail() {
        this.logger.log("Debug email endpoint called");
        try {
            const testResult = await this.contactService.testEmailConnection();
            return {
                success: true,
                emailReady: testResult,
                message: "Email connection test completed",
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error("Debug email test failed:", error);
            return {
                success: false,
                emailReady: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.CreateContactDTO]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "submitContact", null);
__decorate([
    (0, common_1.Get)("health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "checkEmailHealth", null);
__decorate([
    (0, common_1.Get)("debug-email"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "debugEmail", null);
exports.ContactController = ContactController = ContactController_1 = __decorate([
    (0, common_1.Controller)("contact"),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [contact_service_1.ContactService,
        config_1.ConfigService])
], ContactController);
;
//# sourceMappingURL=contact.controller.js.map