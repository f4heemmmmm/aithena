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
var ContactService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const nodemailer = require("nodemailer");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
let ContactService = ContactService_1 = class ContactService {
    configService;
    logger = new common_1.Logger(ContactService_1.name);
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.initializeTransporter();
    }
    initializeTransporter() {
        const smtpHost = this.configService.get("SMTP_HOST");
        const smtpPort = this.configService.get("SMTP_PORT");
        const smtpUser = this.configService.get("SMTP_USER");
        const smtpPass = this.configService.get("SMTP_PASS");
        const smtpSecure = this.configService.get("SMTP_SECURE", false);
        this.logger.log("🔧 Initializing email transporter...");
        this.logger.log(`📧 SMTP Host: ${smtpHost}`);
        this.logger.log(`📧 SMTP Port: ${smtpPort}`);
        this.logger.log(`📧 SMTP Secure: ${smtpSecure}`);
        this.logger.log(`📧 SMTP User: ${smtpUser}`);
        this.logger.log(`📧 SMTP Pass: ${smtpPass ? "***" + smtpPass.slice(-4) : "NOT_SET"}`);
        this.logger.log(`📧 SMTP Pass Length: ${smtpPass ? smtpPass.length : 0} characters`);
        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
            this.logger.error("❌ Missing SMTP configuration!");
            this.logger.error(`Missing: ${[
                !smtpHost && "SMTP_HOST",
                !smtpPort && "SMTP_PORT",
                !smtpUser && "SMTP_USER",
                !smtpPass && "SMTP_PASS"
            ].filter(Boolean).join(", ")}`);
            return;
        }
        const cleanPassword = smtpPass.replace(/\s/g, "");
        this.logger.log(`📧 Cleaned password length: ${cleanPassword.length}`);
        if (cleanPassword.length !== 16) {
            this.logger.error(`❌ Gmail App Password should be 16 characters, got ${cleanPassword.length}`);
            this.logger.error("Please check your Gmail App Password format");
        }
        try {
            this.transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: smtpUser,
                    pass: cleanPassword,
                },
                tls: {
                    rejectUnauthorized: false
                },
                debug: process.env.NODE_ENV === "development",
                logger: process.env.NODE_ENV === "development",
            });
            this.logger.log("✅ Gmail transporter created successfully");
        }
        catch (error) {
            this.logger.error("❌ Error creating Gmail transporter:", error.message);
        }
    }
    async sendContactEmail(contactData) {
        try {
            this.logger.log("Processing contact form submission...");
            const { first_name, last_name, email, message } = contactData;
            if (!this.transporter) {
                this.logger.error("Email transporter not configured");
                throw new common_1.BadRequestException("Email service not available - transporter not initialized");
            }
            try {
                this.logger.log("Testing email connection...");
                await this.testConnectionWithTimeout();
                this.logger.log("Email connection verified");
            }
            catch (verifyError) {
                this.logger.error("Email connection verification failed:", verifyError.message);
                throw new common_1.BadRequestException(`Email connection failed: ${verifyError.message}`);
            }
            const notificationEmail = {
                from: `"Althena Contact Form" <${this.configService.get("SMTP_USER")}>`,
                to: this.configService.get("CONTACT_EMAIL"),
                subject: `New Contact Form Submission - ${first_name} ${last_name}`,
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Contact Form Submission</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0;">
                            
                            <!-- Header -->
                            <div style="background: #ffffff; padding: 24px; border-bottom: 1px solid #e0e0e0;">
                                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                                    New Contact Form Submission
                                </h1>
                                <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
                                    Received on ${new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })}
                                </p>
                            </div>

                            <!-- Contact Details -->
                            <div style="padding: 24px;">
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555; width: 100px;">
                                            Name:
                                        </td>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #333;">
                                            ${first_name} ${last_name}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #555;">
                                            Email:
                                        </td>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                                            <a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">
                                                ${email}
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; font-weight: 600; color: #555;">
                                            Date:
                                        </td>
                                        <td style="padding: 12px 0; color: #333;">
                                            ${new Date().toLocaleString()}
                                        </td>
                                    </tr>
                                </table>

                                <!-- Message -->
                                <div style="margin-bottom: 24px;">
                                    <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #333;">
                                        Message:
                                    </h2>
                                    <div style="background: #f8f9fa; padding: 16px; border-left: 4px solid #0066cc; white-space: pre-wrap; line-height: 1.5;">
                                        ${message}
                                    </div>
                                </div>

                                <!-- Reply Button -->
                                <div style="text-align: center; margin-top: 24px;">
                                    <a href="mailto:${email}?subject=Re: Your inquiry&body=Hello ${first_name},%0D%0A%0D%0AThank you for contacting us." 
                                       style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">
                                        Reply to ${first_name}
                                    </a>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background: #f8f9fa; padding: 16px; border-top: 1px solid #e0e0e0; text-align: center;">
                                <p style="margin: 0; color: #666; font-size: 12px;">
                                    This email was automatically generated by the Althena contact form.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                replyTo: email,
            };
            const autoReplyEmail = {
                from: `"Althena" <${this.configService.get("SMTP_USER")}>`,
                to: email,
                subject: "Thank you for contacting us",
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Thank You - Althena</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0;">
                            
                            <!-- Header -->
                            <div style="background: #ffffff; padding: 32px 24px; border-bottom: 1px solid #e0e0e0; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">
                                    Thank You
                                </h1>
                                <p style="margin: 8px 0 0 0; color: #666; font-size: 16px;">
                                    We"ve received your message
                                </p>
                            </div>

                            <!-- Content -->
                            <div style="padding: 32px 24px;">
                                <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">
                                    Dear ${first_name},
                                </p>
                                
                                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5;">
                                    Thank you for contacting us. We have received your message and will respond within 24 hours.
                                </p>

                                <!-- Message Summary -->
                                <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 4px; padding: 16px; margin: 24px 0;">
                                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Your Message
                                    </h3>
                                    <p style="margin: 0; color: #666; font-style: italic; line-height: 1.5; font-size: 14px;">
                                        "${message.length > 150 ? message.substring(0, 150) + "..." : message}"
                                    </p>
                                </div>

                                <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.5;">
                                    If you have any urgent questions, please don"t hesitate to contact us directly at 
                                    <a href="mailto:hello@althena.sg" style="color: #0066cc; text-decoration: none;">hello@althena.sg</a>.
                                </p>

                                <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.5;">
                                    Best regards,<br>
                                    <strong>The Althena Team</strong>
                                </p>
                            </div>

                            <!-- Footer -->
                            <div style="background: #f8f9fa; padding: 24px; border-top: 1px solid #e0e0e0; text-align: center;">
                                <p style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 500;">
                                    Althena
                                </p>
                                <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.4;">
                                    160 Robinson Road, #14-04, Singapore Business Federation Center<br>
                                    This is an automated message. Please do not reply to this email.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            };
            this.logger.log("Sending notification email...");
            await this.transporter.sendMail(notificationEmail);
            this.logger.log("Notification email sent successfully");
            this.logger.log("Sending auto-reply email...");
            await this.transporter.sendMail(autoReplyEmail);
            this.logger.log("Auto-reply email sent successfully");
            this.logger.log(`Contact form emails sent successfully for ${first_name} ${last_name}`);
            return {
                success: true,
                message: "Message sent successfully! We\"ll get back to you soon.",
            };
        }
        catch (error) {
            this.logger.error("Failed to send emails:", error);
            if (error && typeof error === "object" && "code" in error) {
                const emailError = error;
                if (emailError.code === "EAUTH") {
                    throw new common_1.BadRequestException("Gmail authentication failed. Check your email and app password.");
                }
                else if (emailError.code === "ECONNECTION" || emailError.code === "ETIMEDOUT") {
                    throw new common_1.BadRequestException("Unable to connect to Gmail servers. Check your internet connection.");
                }
                else if (emailError.code === "EMESSAGE") {
                    throw new common_1.BadRequestException("Invalid email format.");
                }
            }
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : "Unknown email error";
            throw new common_1.BadRequestException(`Email sending failed: ${errorMessage}`);
        }
    }
    async testConnectionWithTimeout() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Gmail connection timeout (15s)"));
            }, 15000);
            this.transporter.verify((error, success) => {
                clearTimeout(timeout);
                if (error) {
                    this.logger.error("❌ Gmail verify callback error:", error);
                    reject(error);
                }
                else {
                    this.logger.log("✅ Gmail verify callback success:", success);
                    resolve();
                }
            });
        });
    }
    async testEmailConnection() {
        try {
            if (!this.transporter) {
                this.logger.error("❌ Email transporter not initialized");
                return false;
            }
            this.logger.log("🧪 Testing Gmail connection...");
            await this.testConnectionWithTimeout();
            this.logger.log("✅ Gmail connection test successful");
            return true;
        }
        catch (error) {
            this.logger.error("❌ Gmail connection test failed:", error.message);
            this.logger.error("❌ Error details:", {
                code: error.code,
                command: error.command,
                response: error.response,
                stack: error.stack?.substring(0, 500),
            });
            return false;
        }
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = ContactService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ContactService);
;
//# sourceMappingURL=contact.service.js.map