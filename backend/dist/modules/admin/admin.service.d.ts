import { Repository } from "typeorm";
import { Administrator } from "./admin.entity";
import { CreateAdministratorDTO, UpdateAdministratorDTO } from "./admin.dto";
export declare class AdministratorService {
    private readonly administratorRepository;
    private readonly logger;
    constructor(administratorRepository: Repository<Administrator>);
    create(createAdministratorDTO: CreateAdministratorDTO): Promise<Administrator>;
    findAll(): Promise<Administrator[]>;
    findOne(id: string): Promise<Administrator>;
    findByEmail(email: string): Promise<Administrator | null>;
    update(id: string, updateAdministratorDTO: UpdateAdministratorDTO): Promise<Administrator>;
    remove(id: string): Promise<{
        message: string;
    }>;
    validateLogin(email: string, password: string): Promise<Administrator>;
    count(): Promise<number>;
}
