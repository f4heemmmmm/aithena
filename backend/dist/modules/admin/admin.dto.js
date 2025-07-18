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
exports.AdministratorResponseDTO = exports.LoginAdministratorDTO = exports.UpdateAdministratorDTO = exports.CreateAdministratorDTO = void 0;
const class_validator_1 = require("class-validator");
class CreateAdministratorDTO {
    email;
    password;
    first_name;
    last_name;
}
exports.CreateAdministratorDTO = CreateAdministratorDTO;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid email address" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Email address is required" }),
    __metadata("design:type", String)
], CreateAdministratorDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Password must be a string" }),
    (0, class_validator_1.MinLength)(8, { message: "Password must be at least 8 characters long" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Password is required" }),
    __metadata("design:type", String)
], CreateAdministratorDTO.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "First name must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "First name is required" }),
    __metadata("design:type", String)
], CreateAdministratorDTO.prototype, "first_name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Last name must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Last name is required" }),
    __metadata("design:type", String)
], CreateAdministratorDTO.prototype, "last_name", void 0);
class UpdateAdministratorDTO {
    email;
    password;
    first_name;
    last_name;
}
exports.UpdateAdministratorDTO = UpdateAdministratorDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid email address" }),
    __metadata("design:type", String)
], UpdateAdministratorDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Password must be a string" }),
    (0, class_validator_1.MinLength)(8, { message: "Password must be at least 8 characters long" }),
    __metadata("design:type", String)
], UpdateAdministratorDTO.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "First name must be a string" }),
    __metadata("design:type", String)
], UpdateAdministratorDTO.prototype, "first_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Last name must be a string" }),
    __metadata("design:type", String)
], UpdateAdministratorDTO.prototype, "last_name", void 0);
class LoginAdministratorDTO {
    email;
    password;
}
exports.LoginAdministratorDTO = LoginAdministratorDTO;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: "Please provide a valid email address" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Email address is required" }),
    __metadata("design:type", String)
], LoginAdministratorDTO.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Password must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Password is required" }),
    __metadata("design:type", String)
], LoginAdministratorDTO.prototype, "password", void 0);
class AdministratorResponseDTO {
    id;
    email;
    first_name;
    last_name;
    created_at;
    updated_at;
}
exports.AdministratorResponseDTO = AdministratorResponseDTO;
//# sourceMappingURL=admin.dto.js.map