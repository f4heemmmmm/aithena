import { Repository } from 'typeorm';
import { BlogPost, BlogCategory } from './blog.entity';
import { CreateBlogPostDTO, UpdateBlogPostDTO, BlogPostResponseDTO } from './blog.dto';
export interface BlogPostQuery {
    page?: number;
    limit?: number;
    search?: string;
    is_published?: boolean;
    is_featured?: boolean;
    author_id?: string;
    categories?: BlogCategory[];
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface BlogStatistics {
    total: number;
    published: number;
    drafts: number;
    featured: number;
    recently_published: number;
    total_views: number;
    by_category: Record<BlogCategory, number>;
}
export declare class BlogPostService {
    private readonly blogPostRepository;
    private readonly logger;
    constructor(blogPostRepository: Repository<BlogPost>);
    private generateUniqueSlug;
    private isSlugTaken;
    private validateAuthor;
    private validateCategories;
    create(createBlogPostDTO: CreateBlogPostDTO, author_id: string): Promise<BlogPostResponseDTO>;
    findAll(query?: BlogPostQuery): Promise<PaginatedResult<BlogPostResponseDTO>>;
    findByCategory(category: BlogCategory, published?: boolean): Promise<BlogPostResponseDTO[]>;
    findPublished(): Promise<BlogPostResponseDTO[]>;
    findFeatured(limit?: number): Promise<BlogPostResponseDTO[]>;
    findRecent(limit?: number): Promise<BlogPostResponseDTO[]>;
    findOne(id: string): Promise<BlogPostResponseDTO>;
    findBySlug(slug: string): Promise<BlogPostResponseDTO>;
    incrementViewBySlug(slug: string): Promise<number>;
    update(id: string, updateBlogPostDTO: UpdateBlogPostDTO): Promise<BlogPostResponseDTO>;
    remove(id: string): Promise<{
        message: string;
    }>;
    count(): Promise<number>;
    countPublished(): Promise<number>;
    countFeatured(): Promise<number>;
    countDrafts(): Promise<number>;
    countby_category(category: BlogCategory): Promise<number>;
    gettotal_views(): Promise<number>;
    findByAuthor(author_id: string, includeUnpublished?: boolean): Promise<BlogPostResponseDTO[]>;
    searchPosts(searchTerm: string, onlyPublished?: boolean): Promise<BlogPostResponseDTO[]>;
    getStatistics(): Promise<BlogStatistics>;
    getCategoryDebugInfo(): Promise<Record<string, any>>;
}
