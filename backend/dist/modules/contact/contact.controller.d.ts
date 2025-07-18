import { ConfigService } from "@nestjs/config";
import { CreateContactDTO } from "./contact.dto";
import { ContactService } from "./contact.service";
import { EmailResponse } from "./contact.interface";
export declare class ContactController {
    private readonly contactService;
    private readonly configService;
    private readonly logger;
    constructor(contactService: ContactService, configService: ConfigService);
    submitContact(createContactDTO: CreateContactDTO): Promise<EmailResponse>;
    checkEmailHealth(): Promise<{
        status: string;
        emailReady: boolean;
        config: any;
        timestamp: string;
    }>;
    debugEmail(): Promise<any>;
}
