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
var BlogPostService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPostService = void 0;
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const blog_entity_1 = require("./blog.entity");
let BlogPostService = BlogPostService_1 = class BlogPostService {
    blogPostRepository;
    logger = new common_1.Logger(BlogPostService_1.name);
    constructor(blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }
    async generateUniqueSlug(title, excludeId) {
        try {
            let baseSlug = blog_entity_1.BlogPost.generateSlug(title);
            let slug = baseSlug;
            let counter = 1;
            while (await this.isSlugTaken(slug, excludeId)) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            return slug;
        }
        catch (error) {
            this.logger.error(`Error generating unique slug: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to generate unique slug');
        }
    }
    async isSlugTaken(slug, excludeId) {
        try {
            const queryBuilder = this.blogPostRepository
                .createQueryBuilder('post')
                .where('post.slug = :slug', { slug });
            if (excludeId) {
                queryBuilder.andWhere('post.id != :excludeId', { excludeId });
            }
            const existingPost = await queryBuilder.getOne();
            return !!existingPost;
        }
        catch (error) {
            this.logger.error(`Error checking slug availability: ${error.message}`, error.stack);
            return false;
        }
    }
    validateAuthor(author_id) {
        if (!author_id) {
            throw new common_1.BadRequestException('Author ID is required');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(author_id)) {
            throw new common_1.BadRequestException('Invalid author ID format');
        }
    }
    validateCategories(categories) {
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return [blog_entity_1.BlogCategory.NEWSROOM];
        }
        const validCategories = Object.values(blog_entity_1.BlogCategory);
        const uniqueCategories = [...new Set(categories)].filter(category => validCategories.includes(category));
        return uniqueCategories.length > 0 ? uniqueCategories : [blog_entity_1.BlogCategory.NEWSROOM];
    }
    async create(createBlogPostDTO, author_id) {
        try {
            this.validateAuthor(author_id);
            const { title, content, excerpt, featured_image, uploaded_image, uploaded_image_filename, uploaded_image_content_type, is_published, is_featured, categories } = createBlogPostDTO;
            const slug = await this.generateUniqueSlug(title);
            const validatedCategories = this.validateCategories(categories || [blog_entity_1.BlogCategory.NEWSROOM]);
            this.logger.log(`🚀 Creating blog post with categories: ${validatedCategories.join(', ')}`);
            const blogPost = this.blogPostRepository.create({
                title: title.trim(),
                slug,
                content: content.trim(),
                excerpt: excerpt?.trim() || null,
                featured_image: featured_image || null,
                uploaded_image: uploaded_image || null,
                uploaded_image_filename: uploaded_image_filename || null,
                uploaded_image_content_type: uploaded_image_content_type || null,
                is_published: is_published || false,
                is_featured: is_featured || false,
                view_count: 0,
                categories: validatedCategories,
                author_id: author_id,
                published_at: is_published ? new Date() : null,
            });
            const savedPost = await this.blogPostRepository.save(blogPost);
            this.logger.log(`✅ Blog post created with ID: ${savedPost.id}, categories: ${savedPost.categories.join(', ')}`);
            return await this.findOne(savedPost.id);
        }
        catch (error) {
            this.logger.error(`❌ Error creating blog post: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create blog post');
        }
    }
    async findAll(query = {}) {
        try {
            const { page = 1, limit = 10, search, is_published, is_featured, categories, author_id } = query;
            const skip = (page - 1) * limit;
            const queryBuilder = this.blogPostRepository
                .createQueryBuilder('post')
                .leftJoinAndSelect('post.author', 'author')
                .orderBy('post.created_at', 'DESC');
            if (search && search.trim()) {
                queryBuilder.andWhere('(post.title ILIKE :search OR post.content ILIKE :search OR post.excerpt ILIKE :search)', { search: `%${search.trim()}%` });
            }
            if (is_published !== undefined) {
                queryBuilder.andWhere('post.is_published = :is_published', { is_published });
            }
            if (is_featured !== undefined) {
                queryBuilder.andWhere('post.is_featured = :is_featured', { is_featured });
            }
            if (author_id) {
                this.validateAuthor(author_id);
                queryBuilder.andWhere('post.author_id = :author_id', { author_id });
            }
            if (categories && categories.length > 0) {
                const validCategories = this.validateCategories(categories);
                this.logger.log(`🔍 Filtering by categories: ${validCategories.join(', ')}`);
                const categoryConditions = validCategories.map((cat, index) => `post.categories::text LIKE :categoryPattern${index}`).join(' OR ');
                const categoryParams = validCategories.reduce((params, category, index) => {
                    params[`categoryPattern${index}`] = `%"${category}"%`;
                    return params;
                }, {});
                queryBuilder.andWhere(`(${categoryConditions})`, categoryParams);
            }
            const total = await queryBuilder.getCount();
            const posts = await queryBuilder.skip(skip).take(limit).getMany();
            const data = posts.map(post => post.toResponseObject());
            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            this.logger.error(`Error finding blog posts: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve blog posts');
        }
    }
    async findByCategory(category, published = true) {
        try {
            if (!Object.values(blog_entity_1.BlogCategory).includes(category)) {
                throw new common_1.BadRequestException('Invalid category');
            }
            this.logger.log(`🔍 Finding posts by category: ${category}, published: ${published}`);
            const queryBuilder = this.blogPostRepository
                .createQueryBuilder('post')
                .leftJoinAndSelect('post.author', 'author')
                .orderBy('post.published_at', 'DESC');
            if (published) {
                queryBuilder.andWhere('post.is_published = :is_published', { is_published: true });
            }
            queryBuilder.andWhere('post.categories::text LIKE :categoryPattern', { categoryPattern: `%"${category}"%` });
            const posts = await queryBuilder.getMany();
            this.logger.log(`📊 Database query returned ${posts.length} posts for category ${category}`);
            const filteredPosts = posts.filter(post => {
                if (!post.categories) {
                    this.logger.warn(`⚠️ Post ${post.id} has no categories`);
                    return false;
                }
                const postCategories = Array.isArray(post.categories)
                    ? post.categories
                    : [post.categories].filter(Boolean);
                const hasCategory = postCategories.includes(category);
                this.logger.debug(`📝 Post ${post.id} "${post.title}": categories=[${postCategories.join(', ')}], has ${category}: ${hasCategory}`);
                return hasCategory;
            });
            this.logger.log(`✅ Final result: ${filteredPosts.length} posts for category ${category}`);
            return filteredPosts.map(post => post.toResponseObject());
        }
        catch (error) {
            this.logger.error(`❌ Error finding posts by category: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.warn(`Returning empty array for category ${category} due to error`);
            return [];
        }
    }
    async findPublished() {
        try {
            const posts = await this.blogPostRepository.find({
                where: { is_published: true },
                relations: ['author'],
                order: { published_at: 'DESC' },
            });
            return posts.map(post => post.toResponseObject());
        }
        catch (error) {
            this.logger.error(`Error finding published posts: ${error.message}`, error.stack);
            return [];
        }
    }
    async findFeatured(limit = 3) {
        try {
            const posts = await this.blogPostRepository.find({
                where: {
                    is_published: true,
                    is_featured: true
                },
                relations: ['author'],
                order: { published_at: 'DESC' },
                take: Math.max(1, Math.min(limit, 50)),
            });
            return posts.map(post => post.toResponseObject());
        }
        catch (error) {
            this.logger.error(`Error finding featured posts: ${error.message}`, error.stack);
            return [];
        }
    }
    async findRecent(limit = 5) {
        try {
            const posts = await this.blogPostRepository.find({
                where: { is_published: true },
                relations: ['author'],
                order: { published_at: 'DESC' },
                take: Math.max(1, Math.min(limit, 50)),
            });
            return posts.map(post => post.toResponseObject());
        }
        catch (error) {
            this.logger.error(`Error finding recent posts: ${error.message}`, error.stack);
            return [];
        }
    }
    async findOne(id) {
        try {
            this.validateAuthor(id);
            const post = await this.blogPostRepository.findOne({
                where: { id },
                relations: ['author'],
            });
            if (!post) {
                throw new common_1.NotFoundException(`Blog post with ID ${id} not found`);
            }
            return post.toResponseObject();
        }
        catch (error) {
            this.logger.error(`Error finding blog post: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve blog post');
        }
    }
    async findBySlug(slug) {
        try {
            if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
                throw new common_1.BadRequestException('Valid slug is required');
            }
            const post = await this.blogPostRepository.findOne({
                where: { slug: slug.trim(), is_published: true },
                relations: ['author'],
            });
            if (!post) {
                throw new common_1.NotFoundException(`Published blog post with slug "${slug}" not found`);
            }
            return post.toResponseObject();
        }
        catch (error) {
            this.logger.error(`Error finding blog post by slug: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve blog post');
        }
    }
    async incrementViewBySlug(slug) {
        try {
            if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
                throw new common_1.BadRequestException('Valid slug is required');
            }
            const post = await this.blogPostRepository.findOne({
                where: { slug: slug.trim(), is_published: true },
            });
            if (!post) {
                throw new common_1.NotFoundException(`Published blog post with slug "${slug}" not found`);
            }
            await this.blogPostRepository.increment({ id: post.id }, 'view_count', 1);
            const updatedPost = await this.blogPostRepository.findOne({
                where: { id: post.id },
                select: ['view_count']
            });
            this.logger.log(`View count incremented for post ${post.id}, new count: ${updatedPost?.view_count || post.view_count + 1}`);
            return updatedPost?.view_count || post.view_count + 1;
        }
        catch (error) {
            this.logger.error(`Error incrementing view count: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to increment view count');
        }
    }
    async update(id, updateBlogPostDTO) {
        try {
            this.validateAuthor(id);
            const post = await this.blogPostRepository.findOne({
                where: { id },
            });
            if (!post) {
                throw new common_1.NotFoundException(`Blog post with ID ${id} not found`);
            }
            if (updateBlogPostDTO.title && updateBlogPostDTO.title !== post.title) {
                const newSlug = await this.generateUniqueSlug(updateBlogPostDTO.title, id);
                updateBlogPostDTO.slug = newSlug;
            }
            if (updateBlogPostDTO.categories) {
                const validatedCategories = this.validateCategories(updateBlogPostDTO.categories);
                updateBlogPostDTO.categories = validatedCategories;
                this.logger.log(`📝 Updating categories for post ${id}: ${validatedCategories.join(', ')}`);
            }
            if (updateBlogPostDTO.is_published !== undefined) {
                if (updateBlogPostDTO.is_published && !post.is_published) {
                    updateBlogPostDTO.published_at = new Date();
                }
                else if (!updateBlogPostDTO.is_published && post.is_published) {
                    updateBlogPostDTO.published_at = null;
                    updateBlogPostDTO.is_featured = false;
                }
            }
            if (updateBlogPostDTO.is_featured &&
                (updateBlogPostDTO.is_published === false ||
                    (!updateBlogPostDTO.is_published && !post.is_published))) {
                throw new common_1.BadRequestException('Cannot feature an unpublished post');
            }
            Object.assign(post, updateBlogPostDTO);
            const updatedPost = await this.blogPostRepository.save(post);
            this.logger.log(`✅ Blog post updated with ID: ${updatedPost.id}, categories: ${updatedPost.categories?.join(', ') || 'none'}`);
            return await this.findOne(updatedPost.id);
        }
        catch (error) {
            this.logger.error(`Error updating blog post: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update blog post');
        }
    }
    async remove(id) {
        try {
            this.validateAuthor(id);
            const post = await this.blogPostRepository.findOne({
                where: { id },
            });
            if (!post) {
                throw new common_1.NotFoundException(`Blog post with ID ${id} not found`);
            }
            await this.blogPostRepository.remove(post);
            this.logger.log(`Blog post deleted with ID: ${id}`);
            return { message: 'Blog post deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting blog post: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to delete blog post');
        }
    }
    async count() {
        try {
            return await this.blogPostRepository.count();
        }
        catch (error) {
            this.logger.error(`Error counting blog posts: ${error.message}`, error.stack);
            return 0;
        }
    }
    async countPublished() {
        try {
            return await this.blogPostRepository.count({
                where: { is_published: true },
            });
        }
        catch (error) {
            this.logger.error(`Error counting published posts: ${error.message}`, error.stack);
            return 0;
        }
    }
    async countFeatured() {
        try {
            return await this.blogPostRepository.count({
                where: {
                    is_published: true,
                    is_featured: true
                },
            });
        }
        catch (error) {
            this.logger.error(`Error counting featured posts: ${error.message}`, error.stack);
            return 0;
        }
    }
    async countDrafts() {
        try {
            return await this.blogPostRepository.count({
                where: { is_published: false },
            });
        }
        catch (error) {
            this.logger.error(`Error counting draft posts: ${error.message}`, error.stack);
            return 0;
        }
    }
    async countby_category(category) {
        try {
            const count = await this.blogPostRepository
                .createQueryBuilder('post')
                .where('post.is_published = :is_published', { is_published: true })
                .andWhere('post.categories::text LIKE :categoryPattern', {
                categoryPattern: `%"${category}"%`
            })
                .getCount();
            this.logger.log(`📊 Count for category ${category}: ${count}`);
            return count;
        }
        catch (error) {
            this.logger.error(`Error counting posts by category: ${error.message}`, error.stack);
            return 0;
        }
    }
    async gettotal_views() {
        try {
            const result = await this.blogPostRepository
                .createQueryBuilder('post')
                .select('SUM(post.view_count)', 'total')
                .where('post.is_published = :is_published', { is_published: true })
                .getRawOne();
            return parseInt(result?.total || '0', 10);
        }
        catch (error) {
            this.logger.error(`Error counting total views: ${error.message}`, error.stack);
            return 0;
        }
    }
    async findByAuthor(author_id, includeUnpublished = false) {
        try {
            this.validateAuthor(author_id);
            const whereCondition = { author_id: author_id };
            if (!includeUnpublished) {
                whereCondition.is_published = true;
            }
            const posts = await this.blogPostRepository.find({
                where: whereCondition,
                relations: ['author'],
                order: { created_at: 'DESC' },
            });
            return posts.map(post => post.toResponseObject());
        }
        catch (error) {
            this.logger.error(`Error finding posts by author: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            return [];
        }
    }
    async searchPosts(searchTerm, onlyPublished = true) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
                return [];
            }
            const cleanSearchTerm = searchTerm.trim();
            const queryBuilder = this.blogPostRepository
                .createQueryBuilder('post')
                .leftJoinAndSelect('post.author', 'author')
                .where('(post.title ILIKE :search OR post.content ILIKE :search OR post.excerpt ILIKE :search)', { search: `%${cleanSearchTerm}%` })
                .orderBy('post.published_at', 'DESC');
            if (onlyPublished) {
                queryBuilder.andWhere('post.is_published = :is_published', { is_published: true });
            }
            const posts = await queryBuilder.take(50).getMany();
            return posts.map(post => post.toResponseObject());
        }
        catch (error) {
            this.logger.error(`Error searching posts: ${error.message}`, error.stack);
            return [];
        }
    }
    async getStatistics() {
        try {
            const [total, published, drafts, featured, total_views] = await Promise.all([
                this.count(),
                this.countPublished(),
                this.countDrafts(),
                this.countFeatured(),
                this.gettotal_views(),
            ]);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recently_published = await this.blogPostRepository.count({
                where: {
                    is_published: true,
                    published_at: (0, typeorm_1.MoreThan)(sevenDaysAgo),
                },
            });
            const by_category = {};
            for (const category of Object.values(blog_entity_1.BlogCategory)) {
                by_category[category] = await this.countby_category(category);
            }
            return {
                total,
                published,
                drafts,
                featured,
                recently_published,
                total_views,
                by_category,
            };
        }
        catch (error) {
            this.logger.error(`Error getting statistics: ${error.message}`, error.stack);
            return {
                total: 0,
                published: 0,
                drafts: 0,
                featured: 0,
                recently_published: 0,
                total_views: 0,
                by_category: {
                    [blog_entity_1.BlogCategory.NEWSROOM]: 0,
                    [blog_entity_1.BlogCategory.THOUGHT_PIECES]: 0,
                    [blog_entity_1.BlogCategory.ACHIEVEMENTS]: 0,
                    [blog_entity_1.BlogCategory.AWARDS_RECOGNITION]: 0,
                },
            };
        }
    }
    async getCategoryDebugInfo() {
        try {
            const debugInfo = {};
            const allPosts = await this.blogPostRepository.find({
                select: ['id', 'title', 'categories', 'is_published']
            });
            debugInfo.totalPosts = allPosts.length;
            debugInfo.publishedPosts = allPosts.filter(p => p.is_published).length;
            const categoryDistribution = {};
            allPosts.forEach(post => {
                if (Array.isArray(post.categories)) {
                    post.categories.forEach(cat => {
                        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
                    });
                }
                else {
                    debugInfo.invalidCategoryFormat = (debugInfo.invalidCategoryFormat || 0) + 1;
                }
            });
            debugInfo.categoryDistribution = categoryDistribution;
            for (const category of Object.values(blog_entity_1.BlogCategory)) {
                const posts = await this.findByCategory(category, true);
                debugInfo[`category_${category}`] = posts.length;
            }
            return debugInfo;
        }
        catch (error) {
            this.logger.error('Error getting category debug info:', error);
            return { error: error.message };
        }
    }
};
exports.BlogPostService = BlogPostService;
exports.BlogPostService = BlogPostService = BlogPostService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(blog_entity_1.BlogPost)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], BlogPostService);
//# sourceMappingURL=blog.service.js.map