import { Administrator } from "../admin/admin.entity";
export declare enum BlogCategory {
    NEWSROOM = "newsroom",
    THOUGHT_PIECES = "thought-pieces",
    ACHIEVEMENTS = "achievements",
    AWARDS_RECOGNITION = "awards-recognition"
}
export declare class BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featured_image: string | null;
    uploaded_image: string | null;
    uploaded_image_filename: string | null;
    uploaded_image_content_type: string | null;
    is_published: boolean;
    is_featured: boolean;
    view_count: number;
    categories: BlogCategory[];
    author_id: string;
    author: Administrator;
    created_at: Date;
    updated_at: Date;
    published_at: Date | null;
    updatePublishedAt(): void;
    validateCategories(): void;
    static generateSlug(title: string): string;
    generateSlugFromTitle(): void;
    toResponseObject(): {
        id: string;
        title: string;
        slug: string;
        content: string;
        excerpt: string | null;
        featured_image: string | null;
        uploaded_image: string | null;
        uploaded_image_filename: string | null;
        uploaded_image_content_type: string | null;
        is_published: boolean;
        is_featured: boolean;
        view_count: number;
        categories: BlogCategory[];
        created_at: Date;
        updated_at: Date;
        published_at: Date | null;
        author: {
            id: string;
            first_name: string;
            last_name: string;
            email: string;
        } | null;
    };
}
