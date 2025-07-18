import { HttpStatus } from "@nestjs/common";
import { AdministratorService } from "./admin.service";
import { CreateAdministratorDTO, UpdateAdministratorDTO } from "./admin.dto";
export declare class AdministratorController {
    private readonly administratorService;
    constructor(administratorService: AdministratorService);
    create(createAdministratorDTO: CreateAdministratorDTO): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./admin.entity").Administrator;
    }>;
    findAll(): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./admin.entity").Administrator[];
        count: number;
    }>;
    findOne(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./admin.entity").Administrator;
    }>;
    update(id: string, updateAdministratorDTO: UpdateAdministratorDTO): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./admin.entity").Administrator;
    }>;
    remove(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
    getProfile(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./admin.entity").Administrator;
    }>;
}
