"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app_module_1 = require("./app.module");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    try {
        console.log("🚀 Starting AITHENA Backend...");
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ["error", "warn", "log", "debug", "verbose"],
        });
        const configService = app.get(config_1.ConfigService);
        app.use(express.json({
            limit: "10mb",
            verify: (req, res, buf) => {
                if (buf.length > 5 * 1024 * 1024) {
                    const clientIp = req.ip || req.connection?.remoteAddress || "unknown";
                    console.log(`📸 Large request received: ${Math.round(buf.length / 1024 / 1024)}MB from ${clientIp}`);
                }
            }
        }));
        app.use(express.urlencoded({
            limit: "10mb",
            extended: true,
            parameterLimit: 50000
        }));
        app.use(express.raw({
            limit: "10mb",
            type: ["image/*", "application/octet-stream"]
        }));
        const frontendUrl = configService.get("FRONTEND_URL") || "http://localhost:3000";
        const allowedOrigins = [
            frontendUrl,
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "https://localhost:3000",
            "https://localhost:3001"
        ];
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    console.warn(`🚫 CORS blocked request from: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "Accept",
                "Origin",
                "X-Requested-With",
                "Content-Length"
            ],
            credentials: true,
            maxAge: 86400,
        });
        app.setGlobalPrefix("api");
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            validationError: {
                target: false,
                value: false,
            },
        }));
        app.use((req, res, next) => {
            if (["POST", "PATCH", "PUT"].includes(req.method)) {
                req.setTimeout(120000);
                res.setTimeout(120000);
            }
            else {
                req.setTimeout(30000);
                res.setTimeout(30000);
            }
            next();
        });
        app.use((req, res, next) => {
            const start = Date.now();
            res.on("finish", () => {
                const duration = Date.now() - start;
                const contentLength = req.get("content-length");
                if (contentLength && parseInt(contentLength) > 1024 * 1024) {
                    console.log(`📊 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${Math.round(parseInt(contentLength) / 1024)}KB`);
                }
            });
            next();
        });
        app.getHttpAdapter().get("/health", (req, res) => {
            res.json({
                status: "OK",
                timestamp: new Date().toISOString(),
                service: "AITHENA Backend",
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            });
        });
        const config = new swagger_1.DocumentBuilder()
            .setTitle("AITHENA API")
            .setDescription(`
                The AITHENA API documentation including Blog, Contact, and Admin modules.
                
                📸 Image Upload Support:
                - Maximum file size: 10MB (original)
                - Supported formats: JPEG, PNG, GIF, WebP
                - Automatic compression applied on frontend
                - Images stored as base64 in database
                
                📋 Blog Features:
                - Rich text editor with image support
                - SEO-friendly slugs
                - View tracking
                - Search functionality
                - Featured/published status
            `)
            .setVersion("1.0")
            .addBearerAuth({
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            name: "JWT",
            description: "Enter JWT token",
            in: "header",
        }, "JWT-auth")
            .addTag("Blog", "Blog post management with image upload support")
            .addTag("Admin", "Administrative functions")
            .addTag("Health", "System health checks")
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup("api/docs", app, document);
        const port = configService.get("PORT") || 3001;
        const nodeEnv = configService.get("NODE_ENV") || "development";
        await app.listen(port);
        console.log("\n🎉 ================================");
        console.log(`🚀 Server running: http://localhost:${port}`);
        console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
        console.log(`🌍 Environment: ${nodeEnv}`);
        console.log(`🔗 CORS enabled for: ${allowedOrigins.join(", ")}`);
        console.log(`📸 Image upload: 10MB max payload size`);
        console.log(`⏱️  Upload timeout: 2 minutes`);
        console.log(`\n📋 Available Health Endpoints:`);
        console.log(`   GET  http://localhost:${port}/health (root)`);
        console.log(`   GET  http://localhost:${port}/api/health (API)`);
        console.log(`   GET  http://localhost:${port}/api/health/blog`);
        console.log(`   GET  http://localhost:${port}/api/health/database`);
        console.log(`\n📝 Available Blog Endpoints:`);
        console.log(`   GET  http://localhost:${port}/api/blog/published`);
        console.log(`   GET  http://localhost:${port}/api/blog/featured`);
        console.log(`   GET  http://localhost:${port}/api/blog/recent`);
        console.log(`   GET  http://localhost:${port}/api/blog/slug/:slug`);
        console.log(`   POST http://localhost:${port}/api/blog/slug/:slug/view`);
        console.log(`   GET  http://localhost:${port}/api/blog/search?q=term`);
        console.log(`   GET  http://localhost:${port}/api/blog/statistics (admin)`);
        console.log(`   POST http://localhost:${port}/api/blog (admin) - 📸 Image upload supported`);
        console.log(`   PATCH http://localhost:${port}/api/blog/:id (admin) - 📸 Image upload supported`);
        console.log(`   DELETE http://localhost:${port}/api/blog/:id (admin)`);
        console.log(`\n🔐 Admin Endpoints:`);
        console.log(`   POST http://localhost:${port}/api/auth/login`);
        console.log(`   GET  http://localhost:${port}/api/admin/* (requires auth)`);
        console.log(`\n📸 Image Upload Features:`);
        console.log(`   • Frontend auto-compression (10MB → ~1MB)`);
        console.log(`   • Base64 storage in database`);
        console.log(`   • Supported: JPEG, PNG, GIF, WebP`);
        console.log(`   • Automatic image optimization`);
        console.log(`   • Drag & drop interface`);
        console.log("🎉 ================================\n");
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map