import { ConfigService } from "@nestjs/config";
import { CreateContactDTO } from "./contact.dto";
import { EmailResponse } from "./contact.interface";
export declare class ContactService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendContactEmail(contactData: CreateContactDTO): Promise<EmailResponse>;
    private testConnectionWithTimeout;
    testEmailConnection(): Promise<boolean>;
}
