import { HttpStatus } from "@nestjs/common";
import { BlogPostService } from "./blog.service";
import { CreateBlogPostDTO, UpdateBlogPostDTO, BlogPostListResponseDTO, BlogPostSingleResponseDTO, BlogCategory } from "./blog.dto";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        sub: string;
        email: string;
        first_name: string;
        last_name: string;
        iat: number;
        exp: number;
    };
}
export declare class BlogPostController {
    private readonly blogPostService;
    private readonly logger;
    constructor(blogPostService: BlogPostService);
    create(createBlogPostDTO: CreateBlogPostDTO, req: AuthenticatedRequest): Promise<BlogPostSingleResponseDTO>;
    findAll(page?: number, limit?: number, search?: string, is_published?: boolean, is_featured?: boolean, categories?: BlogCategory[]): Promise<BlogPostListResponseDTO>;
    findPublished(): Promise<BlogPostListResponseDTO>;
    findFeatured(limit?: number): Promise<BlogPostListResponseDTO>;
    findRecent(limit?: number): Promise<BlogPostListResponseDTO>;
    findByCategory(category: BlogCategory): Promise<BlogPostListResponseDTO>;
    searchPosts(searchTerm: string, onlyPublished?: boolean): Promise<BlogPostListResponseDTO>;
    getStatistics(): Promise<{
        status_code: HttpStatus;
        message: string;
        data: import("./blog.service").BlogStatistics;
    }>;
    findBySlug(slug: string): Promise<BlogPostSingleResponseDTO>;
    incrementViewBySlug(slug: string): Promise<{
        status_code: number;
        message: string;
        view_count: number;
    }>;
    findOne(id: string): Promise<BlogPostSingleResponseDTO>;
    update(id: string, updateBlogPostDTO: UpdateBlogPostDTO, req: AuthenticatedRequest): Promise<BlogPostSingleResponseDTO>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        status_code: number;
        message: string;
    }>;
}
export {};
