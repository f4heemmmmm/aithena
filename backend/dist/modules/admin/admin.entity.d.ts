export declare class Administrator {
    id: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    validatePassword(plainPassword: string): Promise<boolean>;
    toResponseObject(): Omit<this, "password" | "validatePassword" | "toResponseObject">;
}
