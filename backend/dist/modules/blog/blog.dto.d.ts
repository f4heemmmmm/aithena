export declare enum BlogCategory {
    NEWSROOM = "newsroom",
    THOUGHT_PIECES = "thought-pieces",
    ACHIEVEMENTS = "achievements",
    AWARDS_RECOGNITION = "awards-recognition"
}
export declare class CreateBlogPostDTO {
    title: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    uploaded_image?: string;
    uploaded_image_filename?: string;
    uploaded_image_content_type?: string;
    is_published?: boolean;
    is_featured?: boolean;
    categories?: BlogCategory[];
}
export declare class UpdateBlogPostDTO {
    title?: string;
    content?: string;
    excerpt?: string;
    featured_image?: string;
    uploaded_image?: string;
    uploaded_image_filename?: string;
    uploaded_image_content_type?: string;
    is_published?: boolean;
    is_featured?: boolean;
    categories?: BlogCategory[];
}
export declare class BlogAuthorResponseDTO {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}
export declare class BlogPostResponseDTO {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    uploaded_image?: string;
    uploaded_image_filename?: string;
    uploaded_image_content_type?: string;
    is_published: boolean;
    is_featured: boolean;
    view_count: number;
    categories: BlogCategory[];
    author: BlogAuthorResponseDTO;
    created_at: Date;
    updated_at: Date;
    published_at: Date;
}
export declare class BlogPostListResponseDTO {
    status_code: number;
    message: string;
    data: BlogPostResponseDTO[];
    count?: number;
}
export declare class BlogPostSingleResponseDTO {
    status_code: number;
    message: string;
    data: BlogPostResponseDTO;
}
