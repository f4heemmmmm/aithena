export interface BlogAuthor {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featured_image: string;
    is_published: boolean;
    is_featured: boolean;
    author: BlogAuthor;
    created_at: string;
    updated_at: string;
    published_at?: string;
}

export interface BlogPostFormData {
    title: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    is_published: boolean;
    is_featured: boolean;
}

export interface BlogResponse {
    status_code: number;
    message: string;
    data: BlogPost[];
    count?: number;
}

export interface BlogPostResponse {
    status_code: number;
    message: string;
    data: BlogPost;
}

export interface BlogStatisticsResponse {
    status_code: number;
    message: string;
    data: BlogStatistics;
}

export interface BlogStatistics {
    total: number;
    published: number;
    drafts: number;
    featured: number;
    recentlyPublished: number;
}

export interface CreateBlogPostRequest {
    title: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    is_published?: boolean;
    is_featured?: boolean;
}

export interface UpdateBlogPostRequest {
    title?: string;
    content?: string;
    excerpt?: string;
    featured_image?: string;
    is_published?: boolean;
    is_featured?: boolean;
}

export interface BlogPostQuery {
    page?: number;
    limit?: number;
    search?: string;
    isPublished?: boolean;
    isFeatured: boolean;
    authorId?: string;
}

export interface PaginatedBlogResponse {
    status_code: number;
    message: string;
    data: BlogPost[];
    count: number;
    totalPages: number;
    currentPage: number;
}

export interface BlogSearchQuery {
    q: string;
    published?: boolean;
}

export interface ApiError {
    message: string;
    status_code: number;
    error?: string;
    details?: any;
}

export interface BlogPostValidationErrors {
    title?: string;
    content?: string;
    excerpt?: string;
    featured_image?: string;
    general?: string;
}

export interface BlogPostFormState {
    data: BlogPostFormData;
    errors: BlogPostValidationErrors;
    isLoading: boolean;
    isValid: boolean;
}

export interface BlogPostListState {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalPage: number;
        totalItems: number;
        itemsPerPage: number;
    };
    filters: {
        search: string;
        isPublished?: boolean;
        isFeatured?: boolean;
    };
}

export interface BlogPostEditorState {
    post: BlogPost | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
    hasUnsavedChanges: boolean;
}

export interface UseBlogPostsReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    createPost: (data: BlogPostFormData) => Promise<BlogPost>;
    updatePost: (id: string, data: Partial<BlogPostFormData>) => Promise<BlogPost>;
    deletePost: (id: string) => Promise<void>;
}

export interface UseBlogPostReturn {
    post: BlogPost | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updatePost: (data: Partial<BlogPostFormData>) => Promise<BlogPost>;
    deletePost: () => Promise<void>;
}

export interface BlogPostCardProps {
    post: BlogPost;
    showActions?: boolean;
    onEdit?: (post: BlogPost) => void;
    onDelete?: (post: BlogPost) => void;
    onPublishToggle?: (post: BlogPost) => void;
    compact?: boolean;
}

export interface BlogPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post?: BlogPost;
    onSubmit: (data: BlogPostFormData) => Promise<void>;
    isLoading?: boolean;
}

export interface BlogPostsTableProps {
    posts: BlogPost[];
    loading?: boolean;
    onEdit: (post: BlogPost) => void;
    onDelete: (post: BlogPost) => void;
    onPublishToggle: (post: BlogPost) => void;
    onView: (post: BlogPost) => void;
}

export type BlogPostStatus = "draft" | "published" | "featured";

export type SortOption = "created_at" | "published_at" | "updated_at" | "title";

export type SortDirection = "asc" | "desc";

export interface BlogPostSort {
    field: SortOption;
    direction: SortDirection;
}

export interface BlogPostFilter {
    status?: BlogPostStatus[];
    author?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    search?: string;
}