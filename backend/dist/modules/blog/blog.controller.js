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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BlogPostController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPostController = void 0;
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const blog_service_1 = require("./blog.service");
const blog_dto_1 = require("./blog.dto");
let BlogPostController = BlogPostController_1 = class BlogPostController {
    blogPostService;
    logger = new common_1.Logger(BlogPostController_1.name);
    constructor(blogPostService) {
        this.blogPostService = blogPostService;
        this.logger.log("BlogPostController initialized");
    }
    async create(createBlogPostDTO, req) {
        try {
            const authorId = req.user?.id || req.user?.sub;
            if (!authorId) {
                this.logger.error("No author ID found in JWT token", { user: req.user });
                throw new common_1.BadRequestException("Author ID is required - authentication issue");
            }
            this.logger.log(`Creating blog post for author: ${authorId}`, {
                title: createBlogPostDTO.title,
                isPublished: createBlogPostDTO.is_published,
                categories: createBlogPostDTO.categories,
                categoriesType: typeof createBlogPostDTO.categories,
                categoriesLength: createBlogPostDTO.categories?.length,
                categoriesArray: Array.isArray(createBlogPostDTO.categories)
            });
            if (createBlogPostDTO.categories && !Array.isArray(createBlogPostDTO.categories)) {
                this.logger.warn("Categories is not an array, converting:", createBlogPostDTO.categories);
                createBlogPostDTO.categories = [createBlogPostDTO.categories].filter(Boolean);
            }
            const post = await this.blogPostService.create(createBlogPostDTO, authorId);
            this.logger.log(`Blog post created successfully with ID: ${post.id}`, {
                finalCategories: post.categories,
                categoriesCount: post.categories?.length
            });
            return {
                status_code: common_1.HttpStatus.CREATED,
                message: "Blog post created successfully",
                data: post,
            };
        }
        catch (error) {
            this.logger.error(`Error creating blog post: ${error.message}`, {
                error: error.stack,
                body: createBlogPostDTO,
                user: req.user,
                categories: createBlogPostDTO.categories
            });
            throw error;
        }
    }
    async findAll(page, limit, search, is_published, is_featured, categories) {
        try {
            const query = {
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
                search,
                is_published,
                is_featured,
                categories,
            };
            this.logger.log("Fetching all blog posts", { query });
            const result = await this.blogPostService.findAll(query);
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Blog posts retrieved successfully",
                data: result.data,
                count: result.total,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving blog posts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findPublished() {
        try {
            this.logger.log("Fetching published blog posts");
            const posts = await this.blogPostService.findPublished();
            const count = await this.blogPostService.countPublished();
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Published blog posts retrieved successfully",
                data: posts,
                count,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving published posts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findFeatured(limit) {
        try {
            const posts = await this.blogPostService.findFeatured(limit ? Number(limit) : 3);
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Featured blog posts retrieved successfully",
                data: posts,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving featured posts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findRecent(limit) {
        try {
            this.logger.log("Fetching recent blog posts");
            const posts = await this.blogPostService.findRecent(limit ? Number(limit) : 5);
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Recent blog posts retrieved successfully",
                data: posts,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving recent posts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findByCategory(category) {
        try {
            this.logger.log(`Fetching blog posts for category: ${category}`);
            const posts = await this.blogPostService.findByCategory(category, true);
            return {
                status_code: common_1.HttpStatus.OK,
                message: `Blog posts for ${category} retrieved successfully`,
                data: posts,
                count: posts.length,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving posts by category: ${error.message}`, error.stack);
            throw error;
        }
    }
    async searchPosts(searchTerm, onlyPublished) {
        try {
            if (!searchTerm || searchTerm.trim().length < 2) {
                return {
                    status_code: common_1.HttpStatus.OK,
                    message: "Search term too short",
                    data: [],
                    count: 0,
                };
            }
            const posts = await this.blogPostService.searchPosts(searchTerm.trim(), onlyPublished !== false);
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Search results retrieved successfully",
                data: posts,
                count: posts.length,
            };
        }
        catch (error) {
            this.logger.error(`Error searching posts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getStatistics() {
        try {
            this.logger.log("Fetching blog statistics");
            const stats = await this.blogPostService.getStatistics();
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Statistics retrieved successfully",
                data: stats,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving statistics: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findBySlug(slug) {
        try {
            const post = await this.blogPostService.findBySlug(slug);
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Blog post retrieved successfully",
                data: post,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving post by slug: ${error.message}`, error.stack);
            throw error;
        }
    }
    async incrementViewBySlug(slug) {
        try {
            const viewCount = await this.blogPostService.incrementViewBySlug(slug);
            return {
                status_code: common_1.HttpStatus.OK,
                message: "View count incremented successfully",
                view_count: viewCount,
            };
        }
        catch (error) {
            this.logger.error(`Error incrementing view count: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const post = await this.blogPostService.findOne(id);
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Blog post retrieved successfully",
                data: post,
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving post by ID: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(id, updateBlogPostDTO, req) {
        try {
            this.logger.log(`Updating blog post ${id}`, {
                updates: updateBlogPostDTO,
                userId: req.user?.id || req.user?.sub
            });
            const post = await this.blogPostService.update(id, updateBlogPostDTO);
            this.logger.log(`Blog post updated successfully with ID: ${id}`);
            return {
                status_code: common_1.HttpStatus.OK,
                message: "Blog post updated successfully",
                data: post,
            };
        }
        catch (error) {
            this.logger.error(`Error updating post: ${error.message}`, error.stack);
            throw error;
        }
    }
    async remove(id, req) {
        try {
            this.logger.log(`Deleting blog post ${id}`, {
                userId: req.user?.id || req.user?.sub
            });
            const result = await this.blogPostService.remove(id);
            this.logger.log(`Blog post deleted successfully with ID: ${id}`);
            return {
                status_code: common_1.HttpStatus.OK,
                message: result.message,
            };
        }
        catch (error) {
            this.logger.error(`Error deleting post: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.BlogPostController = BlogPostController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JWTAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
    })),
    (0, swagger_1.ApiOperation)({ summary: "Create a new blog post" }),
    (0, swagger_1.ApiBody)({ type: blog_dto_1.CreateBlogPostDTO }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: "Blog post created successfully",
        type: blog_dto_1.BlogPostSingleResponseDTO
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Unauthorized" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blog_dto_1.CreateBlogPostDTO, Object]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JWTAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all blog posts (Admin only)" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number, description: "Page number" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number, description: "Items per page" }),
    (0, swagger_1.ApiQuery)({ name: "search", required: false, type: String, description: "Search term" }),
    (0, swagger_1.ApiQuery)({ name: "isPublished", required: false, type: Boolean, description: "Filter by published status" }),
    (0, swagger_1.ApiQuery)({ name: "isFeatured", required: false, type: Boolean, description: "Filter by featured status" }),
    (0, swagger_1.ApiQuery)({ name: "categories", required: false, isArray: true, enum: blog_dto_1.BlogCategory, description: "Filter by categories" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Blog posts retrieved successfully",
        type: blog_dto_1.BlogPostListResponseDTO
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Unauthorized" }),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("search")),
    __param(3, (0, common_1.Query)("is_published")),
    __param(4, (0, common_1.Query)("is_featured")),
    __param(5, (0, common_1.Query)("categories")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Boolean, Boolean, Array]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("published"),
    (0, swagger_1.ApiOperation)({ summary: "Get all published blog posts (Public)" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Published blog posts retrieved successfully",
        type: blog_dto_1.BlogPostListResponseDTO
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "findPublished", null);
__decorate([
    (0, common_1.Get)("featured"),
    (0, swagger_1.ApiOperation)({ summary: "Get featured blog posts (Public)" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number, description: "Number of posts to return" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Featured blog posts retrieved successfully",
        type: blog_dto_1.BlogPostListResponseDTO
    }),
    __param(0, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "findFeatured", null);
__decorate([
    (0, common_1.Get)("recent"),
    (0, swagger_1.ApiOperation)({ summary: "Get recent blog posts (Public)" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number, description: "Number of posts to return" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Recent blog posts retrieved successfully",
        type: blog_dto_1.BlogPostListResponseDTO
    }),
    __param(0, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "findRecent", null);
__decorate([
    (0, common_1.Get)("category/:category"),
    (0, swagger_1.ApiOperation)({ summary: "Get blog posts by category (Public)" }),
    (0, swagger_1.ApiParam)({ name: "category", enum: blog_dto_1.BlogCategory, description: "Blog post category" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Blog posts retrieved successfully",
        type: blog_dto_1.BlogPostListResponseDTO
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Invalid category" }),
    __param(0, (0, common_1.Param)("category")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)("search"),
    (0, swagger_1.ApiOperation)({ summary: "Search blog posts (Public)" }),
    (0, swagger_1.ApiQuery)({ name: "q", required: true, type: String, description: "Search query" }),
    (0, swagger_1.ApiQuery)({ name: "published", required: false, type: Boolean, description: "Only search published posts" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Search results retrieved successfully",
        type: blog_dto_1.BlogPostListResponseDTO
    }),
    __param(0, (0, common_1.Query)("q")),
    __param(1, (0, common_1.Query)("published")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "searchPosts", null);
__decorate([
    (0, common_1.Get)("statistics"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JWTAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get blog statistics (Admin only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Statistics retrieved successfully" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Unauthorized" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)("slug/:slug"),
    (0, swagger_1.ApiOperation)({ summary: "Get blog post by slug (Public)" }),
    (0, swagger_1.ApiParam)({ name: "slug", type: String, description: "Blog post slug" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Blog post retrieved successfully",
        type: blog_dto_1.BlogPostSingleResponseDTO
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Blog post not found" }),
    __param(0, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)("slug/:slug/view"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: "Increment view count for blog post by slug (Public)" }),
    (0, swagger_1.ApiParam)({ name: "slug", type: String, description: "Blog post slug" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "View count incremented successfully"
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Blog post not found" }),
    __param(0, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "incrementViewBySlug", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get blog post by ID" }),
    (0, swagger_1.ApiParam)({ name: "id", type: String, description: "Blog post UUID" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Blog post retrieved successfully",
        type: blog_dto_1.BlogPostSingleResponseDTO
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Blog post not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JWTAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true
    })),
    (0, swagger_1.ApiOperation)({ summary: "Update blog post" }),
    (0, swagger_1.ApiParam)({ name: "id", type: String, description: "Blog post UUID" }),
    (0, swagger_1.ApiBody)({ type: blog_dto_1.UpdateBlogPostDTO }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Blog post updated successfully",
        type: blog_dto_1.BlogPostSingleResponseDTO
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Unauthorized" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Blog post not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, blog_dto_1.UpdateBlogPostDTO, Object]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JWTAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Delete blog post" }),
    (0, swagger_1.ApiParam)({ name: "id", type: String, description: "Blog post UUID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Blog post deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Unauthorized" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Blog post not found" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BlogPostController.prototype, "remove", null);
exports.BlogPostController = BlogPostController = BlogPostController_1 = __decorate([
    (0, swagger_1.ApiTags)("Blog Posts"),
    (0, common_1.Controller)("blog"),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [blog_service_1.BlogPostService])
], BlogPostController);
//# sourceMappingURL=blog.controller.js.map