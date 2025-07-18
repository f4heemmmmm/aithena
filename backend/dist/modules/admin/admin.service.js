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
var AdministratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministratorService = void 0;
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const admin_entity_1 = require("./admin.entity");
let AdministratorService = AdministratorService_1 = class AdministratorService {
    administratorRepository;
    logger = new common_1.Logger(AdministratorService_1.name);
    constructor(administratorRepository) {
        this.administratorRepository = administratorRepository;
    }
    async create(createAdministratorDTO) {
        const { email, password, first_name, last_name } = createAdministratorDTO;
        const existingAdmin = await this.administratorRepository.findOne({
            where: { email }
        });
        if (existingAdmin) {
            throw new common_1.ConflictException("Administrator with this email already exists");
        }
        const administrator = this.administratorRepository.create({
            email,
            password,
            first_name,
            last_name
        });
        const savedAdmin = await this.administratorRepository.save(administrator);
        return savedAdmin.toResponseObject();
    }
    async findAll() {
        const administrators = await this.administratorRepository.find({
            where: { is_active: true },
            order: { created_at: "DESC" }
        });
        return administrators.map((administrator) => administrator.toResponseObject());
    }
    async findOne(id) {
        const administrator = await this.administratorRepository.findOne({
            where: { id, is_active: true }
        });
        if (!administrator) {
            throw new common_1.NotFoundException("Administrator not found!");
        }
        return administrator.toResponseObject();
    }
    async findByEmail(email) {
        return await this.administratorRepository.findOne({
            where: { email, is_active: true }
        });
    }
    async update(id, updateAdministratorDTO) {
        const administrator = await this.administratorRepository.findOne({
            where: { id, is_active: true },
        });
        if (!administrator) {
            throw new common_1.NotFoundException("Administrator not found");
        }
        if (updateAdministratorDTO.email && updateAdministratorDTO.email !== administrator.email) {
            const existingAdmin = await this.administratorRepository.findOne({
                where: { email: updateAdministratorDTO.email }
            });
            if (existingAdmin) {
                throw new common_1.ConflictException("Administrator with this email already exists");
            }
        }
        Object.assign(administrator, updateAdministratorDTO);
        const updatedAdministrator = await this.administratorRepository.save(administrator);
        return updatedAdministrator.toResponseObject();
    }
    async remove(id) {
        const administrator = await this.administratorRepository.findOne({
            where: { id, is_active: true }
        });
        if (!administrator) {
            throw new common_1.NotFoundException("Administrator not found");
        }
        await this.administratorRepository.update(id, { is_active: false });
        return { message: "Administrator deleted successfully" };
    }
    async validateLogin(email, password) {
        try {
            this.logger.log(`🔍 Attempting login for email: ${email}`);
            this.logger.log(`🔍 Password provided: ${password}`);
            const administrator = await this.administratorRepository.findOne({
                where: { email, is_active: true },
                select: ["id", "email", "password", "first_name", "last_name", "is_active"],
            });
            if (!administrator) {
                this.logger.warn(`❌ Administrator not found for email: ${email}`);
                throw new common_1.UnauthorizedException("Invalid credentials");
            }
            this.logger.log(`✅ Administrator found: ${administrator.email}`);
            this.logger.log(`🔍 Stored password: ${administrator.password}`);
            const isPasswordValid = await administrator.validatePassword(password);
            if (!isPasswordValid) {
                this.logger.warn(`❌ Password validation failed for email: ${email}`);
                this.logger.warn(`Input: "${password}" vs Stored: "${administrator.password}"`);
                throw new common_1.UnauthorizedException("Invalid credentials");
            }
            this.logger.log(`✅ Password validation successful for email: ${email}`);
            return administrator.toResponseObject();
        }
        catch (error) {
            this.logger.error(`❌ Login error for email: ${email}`, error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
    }
    async count() {
        return await this.administratorRepository.count({
            where: { is_active: true }
        });
    }
};
exports.AdministratorService = AdministratorService;
exports.AdministratorService = AdministratorService = AdministratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(admin_entity_1.Administrator)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], AdministratorService);
//# sourceMappingURL=admin.service.js.map