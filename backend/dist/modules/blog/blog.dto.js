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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPostSingleResponseDTO = exports.BlogPostListResponseDTO = exports.BlogPostResponseDTO = exports.BlogAuthorResponseDTO = exports.UpdateBlogPostDTO = exports.CreateBlogPostDTO = exports.BlogCategory = void 0;
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var BlogCategory;
(function (BlogCategory) {
    BlogCategory["NEWSROOM"] = "newsroom";
    BlogCategory["THOUGHT_PIECES"] = "thought-pieces";
    BlogCategory["ACHIEVEMENTS"] = "achievements";
    BlogCategory["AWARDS_RECOGNITION"] = "awards-recognition";
})(BlogCategory || (exports.BlogCategory = BlogCategory = {}));
class CreateBlogPostDTO {
    title;
    content;
    excerpt;
    featured_image;
    uploaded_image;
    uploaded_image_filename;
    uploaded_image_content_type;
    is_published;
    is_featured;
    categories;
}
exports.CreateBlogPostDTO = CreateBlogPostDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Title of blog post", maxLength: 200 }),
    (0, class_validator_1.IsString)({ message: "Title must be a string" }),
    (0, class_validator_1.MaxLength)(200, { message: "Title must less than 200 characters" }),
    (0, class_validator_1.MinLength)(3, { message: "Title must be at least 3 character long" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateBlogPostDTO.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Content of blog post" }),
    (0, class_validator_1.IsString)({ message: "Content must be a string" }),
    (0, class_validator_1.IsNotEmpty)({ message: "Content is required" }),
    (0, class_validator_1.MinLength)(10, { message: "Content must be at least 10 character long" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateBlogPostDTO.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Brief excerpt of blog post", maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Excerpt must be a string" }),
    (0, class_validator_1.MaxLength)(500, { message: "Excerpt must be less than 500 characters" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim() || undefined),
    __metadata("design:type", String)
], CreateBlogPostDTO.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "URL of featured image" }),
    (0, class_validator_1.IsString)({ message: "Featured image must be a string" }),
    (0, class_validator_1.IsUrl)({}, { message: "Featured image must be a valid URL" }),
    (0, class_validator_1.Matches)(/\.(jpg|jpeg|png|gif|webp|svg)$/i, { message: 'Featured image must be a valid image URL' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBlogPostDTO.prototype, "featured_image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Base64 encoded uploaded image data" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Uploaded image must be a string" }),
    __metadata("design:type", String)
], CreateBlogPostDTO.prototype, "uploaded_image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Original filename of uploaded image" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Uploaded image filename must be a string" }),
    (0, class_validator_1.MaxLength)(255, { message: "Filename must be less than 255 characters" }),
    __metadata("design:type", String)
], CreateBlogPostDTO.prototype, "uploaded_image_filename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Content type of uploaded image" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Content type must be a string" }),
    (0, class_validator_1.Matches)(/^image\/(jpeg|jpg|png|gif|webp)$/i, { message: 'Content type must be a valid image MIME type' }),
    __metadata("design:type", String)
], CreateBlogPostDTO.prototype, "uploaded_image_content_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Whether the post should be published immediately", default: false }),
    (0, class_validator_1.IsBoolean)({ message: "Is published must be boolean" }),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateBlogPostDTO.prototype, "is_published", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Whether the post should be featured", default: false }),
    (0, class_validator_1.IsBoolean)({ message: "Is featured must be boolean" }),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateBlogPostDTO.prototype, "is_featured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Categories where the blog post should appear",
        enum: BlogCategory,
        isArray: true,
        default: [BlogCategory.NEWSROOM]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: "Categories must be an array" }),
    (0, class_validator_1.ArrayMinSize)(1, { message: "At least one category must be selected" }),
    (0, class_validator_1.ArrayMaxSize)(4, { message: "Maximum 4 categories allowed" }),
    (0, class_validator_1.IsEnum)(BlogCategory, { each: true, message: "Each category must be a valid blog category" }),
    __metadata("design:type", Array)
], CreateBlogPostDTO.prototype, "categories", void 0);
class UpdateBlogPostDTO {
    title;
    content;
    excerpt;
    featured_image;
    uploaded_image;
    uploaded_image_filename;
    uploaded_image_content_type;
    is_published;
    is_featured;
    categories;
}
exports.UpdateBlogPostDTO = UpdateBlogPostDTO;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Title of blog post", maxLength: 200 }),
    (0, class_validator_1.IsString)({ message: "Title must be a string" }),
    (0, class_validator_1.MaxLength)(200, { message: "Title must less than 200 characters" }),
    (0, class_validator_1.MinLength)(3, { message: "Title must be at least 3 character long" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBlogPostDTO.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Content of blog post" }),
    (0, class_validator_1.IsString)({ message: "Content must be a string" }),
    (0, class_validator_1.MinLength)(10, { message: "Content must be at least 10 character long" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBlogPostDTO.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Brief excerpt of blog post", maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Excerpt must be a string" }),
    (0, class_validator_1.MaxLength)(500, { message: "Excerpt must be less than 500 characters" }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim() || undefined),
    __metadata("design:type", String)
], UpdateBlogPostDTO.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "URL of featured image" }),
    (0, class_validator_1.IsString)({ message: "Featured image must be a string" }),
    (0, class_validator_1.IsUrl)({}, { message: "Featured image must be a valid URL" }),
    (0, class_validator_1.Matches)(/\.(jpg|jpeg|png|gif|webp|svg)$/i, { message: 'Featured image must be a valid image URL' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBlogPostDTO.prototype, "featured_image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Base64 encoded uploaded image data" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Uploaded image must be a string" }),
    __metadata("design:type", String)
], UpdateBlogPostDTO.prototype, "uploaded_image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Original filename of uploaded image" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Uploaded image filename must be a string" }),
    (0, class_validator_1.MaxLength)(255, { message: "Filename must be less than 255 characters" }),
    __metadata("design:type", String)
], UpdateBlogPostDTO.prototype, "uploaded_image_filename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Content type of uploaded image" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Content type must be a string" }),
    (0, class_validator_1.Matches)(/^image\/(jpeg|jpg|png|gif|webp)$/i, { message: 'Content type must be a valid image MIME type' }),
    __metadata("design:type", String)
], UpdateBlogPostDTO.prototype, "uploaded_image_content_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Whether the post should be published immediately", default: false }),
    (0, class_validator_1.IsBoolean)({ message: "Is published must be boolean" }),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateBlogPostDTO.prototype, "is_published", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Whether the post should be featured", default: false }),
    (0, class_validator_1.IsBoolean)({ message: "Is featured must be boolean" }),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateBlogPostDTO.prototype, "is_featured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Categories where the blog post should appear",
        enum: BlogCategory,
        isArray: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: "Categories must be an array" }),
    (0, class_validator_1.ArrayMinSize)(1, { message: "At least one category must be selected" }),
    (0, class_validator_1.ArrayMaxSize)(4, { message: "Maximum 4 categories allowed" }),
    (0, class_validator_1.IsEnum)(BlogCategory, { each: true, message: "Each category must be a valid blog category" }),
    __metadata("design:type", Array)
], UpdateBlogPostDTO.prototype, "categories", void 0);
class BlogAuthorResponseDTO {
    id;
    first_name;
    last_name;
    email;
}
exports.BlogAuthorResponseDTO = BlogAuthorResponseDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Author ID" }),
    __metadata("design:type", String)
], BlogAuthorResponseDTO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Author first name" }),
    __metadata("design:type", String)
], BlogAuthorResponseDTO.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Author last name" }),
    __metadata("design:type", String)
], BlogAuthorResponseDTO.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Author email" }),
    __metadata("design:type", String)
], BlogAuthorResponseDTO.prototype, "email", void 0);
class BlogPostResponseDTO {
    id;
    title;
    slug;
    content;
    excerpt;
    featured_image;
    uploaded_image;
    uploaded_image_filename;
    uploaded_image_content_type;
    is_published;
    is_featured;
    view_count;
    categories;
    author;
    created_at;
    updated_at;
    published_at;
}
exports.BlogPostResponseDTO = BlogPostResponseDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Blog post ID" }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Blog post title" }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Blog post slug" }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Blog post content" }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Blog post excerpt", nullable: true }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Featured image URL", nullable: true }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "featured_image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Uploaded image as base64", nullable: true }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "uploaded_image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Uploaded image filename", nullable: true }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "uploaded_image_filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Uploaded image content type", nullable: true }),
    __metadata("design:type", String)
], BlogPostResponseDTO.prototype, "uploaded_image_content_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Published status" }),
    __metadata("design:type", Boolean)
], BlogPostResponseDTO.prototype, "is_published", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Featured status" }),
    __metadata("design:type", Boolean)
], BlogPostResponseDTO.prototype, "is_featured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "View count", default: 0 }),
    __metadata("design:type", Number)
], BlogPostResponseDTO.prototype, "view_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Blog post categories",
        enum: BlogCategory,
        isArray: true,
        default: [BlogCategory.NEWSROOM]
    }),
    __metadata("design:type", Array)
], BlogPostResponseDTO.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Post author", type: BlogAuthorResponseDTO }),
    __metadata("design:type", BlogAuthorResponseDTO)
], BlogPostResponseDTO.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Created date" }),
    __metadata("design:type", Date)
], BlogPostResponseDTO.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Updated date" }),
    __metadata("design:type", Date)
], BlogPostResponseDTO.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Published date", nullable: true }),
    __metadata("design:type", Date)
], BlogPostResponseDTO.prototype, "published_at", void 0);
class BlogPostListResponseDTO {
    status_code;
    message;
    data;
    count;
}
exports.BlogPostListResponseDTO = BlogPostListResponseDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "HTTP status code" }),
    __metadata("design:type", Number)
], BlogPostListResponseDTO.prototype, "status_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Response message" }),
    __metadata("design:type", String)
], BlogPostListResponseDTO.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Blog posts array", type: [BlogPostResponseDTO] }),
    __metadata("design:type", Array)
], BlogPostListResponseDTO.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Total count", required: false }),
    __metadata("design:type", Number)
], BlogPostListResponseDTO.prototype, "count", void 0);
class BlogPostSingleResponseDTO {
    status_code;
    message;
    data;
}
exports.BlogPostSingleResponseDTO = BlogPostSingleResponseDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "HTTP status code" }),
    __metadata("design:type", Number)
], BlogPostSingleResponseDTO.prototype, "status_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Response message" }),
    __metadata("design:type", String)
], BlogPostSingleResponseDTO.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Blog post data", type: BlogPostResponseDTO }),
    __metadata("design:type", BlogPostResponseDTO)
], BlogPostSingleResponseDTO.prototype, "data", void 0);
//# sourceMappingURL=blog.dto.js.map