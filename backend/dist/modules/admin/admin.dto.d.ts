export declare class CreateAdministratorDTO {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}
export declare class UpdateAdministratorDTO {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
}
export declare class LoginAdministratorDTO {
    email: string;
    password: string;
}
export declare class AdministratorResponseDTO {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: Date;
    updated_at: Date;
}
