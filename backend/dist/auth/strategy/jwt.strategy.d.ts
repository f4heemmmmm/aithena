import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
import { AdministratorService } from "src/modules/admin/admin.service";
export interface JWTPayload {
    sub: string;
    email: string;
    first_name: string;
    last_name: string;
    iat?: number;
    exp?: number;
}
declare const JWTStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JWTStrategy extends JWTStrategy_base {
    private readonly configService;
    private readonly administratorService;
    constructor(configService: ConfigService, administratorService: AdministratorService);
    validate(payload: JWTPayload): Promise<{
        id: string;
        sub: string;
        email: string;
        first_name: string;
        last_name: string;
    }>;
}
export {};
