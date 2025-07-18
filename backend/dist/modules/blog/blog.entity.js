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
var BlogPost_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPost = exports.BlogCategory = void 0;
const typeorm_1 = require("typeorm");
const admin_entity_1 = require("../admin/admin.entity");
var BlogCategory;
(function (BlogCategory) {
    BlogCategory["NEWSROOM"] = "newsroom";
    BlogCategory["THOUGHT_PIECES"] = "thought-pieces";
    BlogCategory["ACHIEVEMENTS"] = "achievements";
    BlogCategory["AWARDS_RECOGNITION"] = "awards-recognition";
})(BlogCategory || (exports.BlogCategory = BlogCategory = {}));
let BlogPost = BlogPost_1 = class BlogPost {
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
    author_id;
    author;
    created_at;
    updated_at;
    published_at;
    updatePublishedAt() {
        if (this.is_published && !this.published_at) {
            this.published_at = new Date();
        }
        else if (!this.is_published) {
            this.published_at = null;
        }
    }
    validateCategories() {
        console.log('🔧 Entity validateCategories - Input:', this.categories, typeof this.categories);
        if (!this.categories || !Array.isArray(this.categories) || this.categories.length === 0) {
            console.log('⚠️ Entity: Categories invalid, setting to default NEWSROOM');
            this.categories = [BlogCategory.NEWSROOM];
            return;
        }
        const validCategories = Object.values(BlogCategory);
        const uniqueCategories = [...new Set(this.categories)].filter(category => validCategories.includes(category));
        console.log('🔍 Entity: Valid categories after filtering:', uniqueCategories);
        if (uniqueCategories.length === 0) {
            console.log('⚠️ Entity: No valid categories found, setting to default NEWSROOM');
            this.categories = [BlogCategory.NEWSROOM];
        }
        else {
            this.categories = uniqueCategories;
            console.log('✅ Entity: Categories set to:', this.categories);
        }
    }
    static generateSlug(title) {
        if (!title || typeof title !== "string") {
            throw new Error("Title is required to generate slug");
        }
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    generateSlugFromTitle() {
        if (this.title && !this.slug) {
            this.slug = BlogPost_1.generateSlug(this.title);
        }
    }
    toResponseObject() {
        let processedCategories = this.categories;
        if (!Array.isArray(processedCategories) || processedCategories.length === 0) {
            console.warn(`⚠️ ResponseObject: Post ${this.id} has invalid categories, using default`);
            processedCategories = [BlogCategory.NEWSROOM];
        }
        const validCategories = processedCategories.filter(cat => Object.values(BlogCategory).includes(cat));
        if (validCategories.length === 0) {
            validCategories.push(BlogCategory.NEWSROOM);
        }
        console.log(`📄 ResponseObject: Post ${this.id} final categories:`, validCategories);
        return {
            id: this.id,
            title: this.title,
            slug: this.slug,
            content: this.content,
            excerpt: this.excerpt,
            featured_image: this.featured_image,
            uploaded_image: this.uploaded_image,
            uploaded_image_filename: this.uploaded_image_filename,
            uploaded_image_content_type: this.uploaded_image_content_type,
            is_published: this.is_published,
            is_featured: this.is_featured,
            view_count: this.view_count,
            categories: validCategories,
            created_at: this.created_at,
            updated_at: this.updated_at,
            published_at: this.published_at,
            author: this.author ? {
                id: this.author.id,
                first_name: this.author.first_name,
                last_name: this.author.last_name,
                email: this.author.email,
            } : null
        };
    }
};
exports.BlogPost = BlogPost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], BlogPost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 200 }),
    __metadata("design:type", String)
], BlogPost.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, type: "varchar", length: 255 }),
    __metadata("design:type", String)
], BlogPost.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], BlogPost.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "varchar", length: 500 }),
    __metadata("design:type", Object)
], BlogPost.prototype, "excerpt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "varchar", length: 2048 }),
    __metadata("design:type", Object)
], BlogPost.prototype, "featured_image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", Object)
], BlogPost.prototype, "uploaded_image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "varchar", length: 255 }),
    __metadata("design:type", Object)
], BlogPost.prototype, "uploaded_image_filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "varchar", length: 100 }),
    __metadata("design:type", Object)
], BlogPost.prototype, "uploaded_image_content_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, type: "boolean" }),
    __metadata("design:type", Boolean)
], BlogPost.prototype, "is_published", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, type: "boolean" }),
    __metadata("design:type", Boolean)
], BlogPost.prototype, "is_featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, type: "integer" }),
    __metadata("design:type", Number)
], BlogPost.prototype, "view_count", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "json",
        nullable: false,
        default: '["newsroom"]'
    }),
    __metadata("design:type", Array)
], BlogPost.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], BlogPost.prototype, "author_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Administrator, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: "author_id" }),
    __metadata("design:type", admin_entity_1.Administrator)
], BlogPost.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at", type: "timestamp" }),
    __metadata("design:type", Date)
], BlogPost.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at", type: "timestamp" }),
    __metadata("design:type", Date)
], BlogPost.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "published_at", nullable: true, type: "timestamp" }),
    __metadata("design:type", Object)
], BlogPost.prototype, "published_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlogPost.prototype, "updatePublishedAt", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlogPost.prototype, "validateCategories", null);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlogPost.prototype, "generateSlugFromTitle", null);
exports.BlogPost = BlogPost = BlogPost_1 = __decorate([
    (0, typeorm_1.Entity)('blog_posts')
], BlogPost);
//# sourceMappingURL=blog.entity.js.map