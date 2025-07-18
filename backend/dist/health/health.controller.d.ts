import { HttpStatus } from "@nestjs/common";
import { HealthService } from "./health.service";
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<{
        status_code: HttpStatus;
        message: string;
        data: {
            status: string;
            timestamp: string;
            uptime: string;
            memory: {
                used: string;
                total: string;
                rss: string;
            };
            version: string;
            database: {
                status: string;
                type: "mysql" | "mariadb" | "postgres" | "cockroachdb" | "sqlite" | "mssql" | "sap" | "oracle" | "cordova" | "nativescript" | "react-native" | "sqljs" | "mongodb" | "aurora-mysql" | "aurora-postgres" | "expo" | "better-sqlite3" | "capacitor" | "spanner";
                database: string | Uint8Array<ArrayBufferLike> | undefined;
                timestamp: string;
                error?: undefined;
            } | {
                status: string;
                error: any;
                timestamp: string;
                type?: undefined;
                database?: undefined;
            };
            service: string;
        };
    }>;
    getDatabaseHealth(): Promise<{
        status_code: HttpStatus;
        message: string;
        data: {
            status: string;
            type: "mysql" | "mariadb" | "postgres" | "cockroachdb" | "sqlite" | "mssql" | "sap" | "oracle" | "cordova" | "nativescript" | "react-native" | "sqljs" | "mongodb" | "aurora-mysql" | "aurora-postgres" | "expo" | "better-sqlite3" | "capacitor" | "spanner";
            database: string | Uint8Array<ArrayBufferLike> | undefined;
            timestamp: string;
            error?: undefined;
        } | {
            status: string;
            error: any;
            timestamp: string;
            type?: undefined;
            database?: undefined;
        };
    }>;
    getBlogHealth(): Promise<{
        status_code: HttpStatus;
        message: string;
        data: {
            status: string;
            totalPosts: number;
            publishedPosts: number;
            timestamp: string;
            error?: undefined;
        } | {
            status: string;
            error: any;
            timestamp: string;
            totalPosts?: undefined;
            publishedPosts?: undefined;
        };
    }>;
}
