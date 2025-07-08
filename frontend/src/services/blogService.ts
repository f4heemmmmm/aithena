import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

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
    featured_image?: string;
    uploaded_image?: string;
    uploaded_image_filename?: string;
    uploaded_image_content_type?: string;
    is_published: boolean;
    is_featured: boolean;
    view_count: number;
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
    uploaded_image?: string;
    uploaded_image_filename?: string;
    uploaded_image_content_type?: string;
    is_published: boolean;
    is_featured: boolean;
}

export interface BlogResponse {
    statusCode: number;
    message: string;
    data: BlogPost[];
    count?: number;
}

export interface BlogPostResponse {
    statusCode: number;
    message: string;
    data: BlogPost;
}

export interface BlogStatistics {
    total: number;
    published: number;
    drafts: number;
    featured: number;
    recentlyPublished: number;
    totalViews: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

export interface BlogPostQuery {
    page?: number;
    limit?: number;
    search?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
}

// New interfaces for image upload functionality
export interface ImageUploadError {
    type: 'file_too_large' | 'invalid_type' | 'upload_failed' | 'processing_failed';
    message: string;
}

export interface UploadedImageData {
    base64: string;
    filename: string;
    contentType: string;
    size: number;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
    statusCode?: number;
}

class ApiServiceError extends Error {
    public statusCode: number;
    public originalError?: unknown;

    constructor(message: string, statusCode: number, originalError?: unknown) {
        super(message);
        this.name = "ApiServiceError";
        this.statusCode = statusCode;
        this.originalError = originalError;
    }
}

class BlogService {
    private api: AxiosInstance;
    private publicApi: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        // Authenticated API instance
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 60000, // Increased timeout for image uploads (60 seconds)
            headers: {
                "Content-Type": "application/json",
            },
            maxContentLength: 10 * 1024 * 1024, // 10MB
            maxBodyLength: 10 * 1024 * 1024, // 10MB
        });

        // Public API instance without authentication
        this.publicApi = axios.create({
            baseURL: this.baseURL,
            timeout: 60000, // Increased timeout for image uploads
            headers: {
                "Content-Type": "application/json",
            },
            maxContentLength: 10 * 1024 * 1024, // 10MB
            maxBodyLength: 10 * 1024 * 1024, // 10MB
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Add authentication token to requests
        this.api.interceptors.request.use(
            (config) => {
                const token = this.getStoredToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: unknown) => {
                return Promise.reject(error);
            }
        );

        // Handle API responses and errors
        const handleResponse = (response: AxiosResponse) => response;
        const handleError = (error: AxiosError) => {
            // Log errors except expected 404s during endpoint discovery
            if (error.response?.status !== 404) {
                console.error("API Error:", {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.response?.data,
                    message: error.message,
                });
            }

            if (error.response?.status === 401) {
                this.handleUnauthorized();
            }
            return Promise.reject(this.formatError(error));
        };

        this.api.interceptors.response.use(handleResponse, handleError);
        this.publicApi.interceptors.response.use(handleResponse, handleError);
    }

    private getStoredToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem("adminToken");
        }
        return null;
    }

    private handleUnauthorized(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminData");
            window.location.href = "/login";
        }
    }

    private formatError(error: AxiosError): ApiError {
        if (error.response?.data) {
            const data = error.response.data as ApiErrorResponse;
            return {
                message: data.message || "An error occurred",
                statusCode: error.response.status,
                error: data.error,
            };
        }
        
        if (error.code === "ECONNABORTED") {
            return {
                message: "Request timeout - please check if the backend server is running or try a smaller image",
                statusCode: 408,
            };
        }

        if (error.code === "ECONNREFUSED") {
            return {
                message: "Connection refused - backend server may not be running",
                statusCode: 503,
            };
        }

        // Handle network errors
        if (error.message?.includes("Network Error")) {
            return {
                message: "Network error - please check your connection",
                statusCode: 0,
            };
        }

        return {
            message: error.message || "Network error",
            statusCode: error.response?.status || 500,
        };
    }

    /**
     * Attempts multiple API endpoints without logging expected 404 failures
     */
    private async tryApiEndpoints<T>(endpoints: string[]): Promise<T> {
        let lastError: AxiosError | null = null;
        const attemptedEndpoints: string[] = [];

        for (const endpoint of endpoints) {
            try {
                const response: AxiosResponse<T> = await this.publicApi.get(endpoint);
                return response.data;
            } catch (error) {
                if (error instanceof Error || (error && typeof error === "object")) {
                    lastError = error as AxiosError;
                }
                attemptedEndpoints.push(endpoint);
                
                // Only log non-404 errors (404s are expected when trying multiple endpoints)
                if ((error as AxiosError)?.response?.status !== 404) {
                    console.warn(`Unexpected error from ${endpoint}:`, error);
                }
            }
        }

        console.warn(`All blog API endpoints failed. Attempted: ${attemptedEndpoints.join(", ")}`);
        
        if (lastError) {
            throw this.formatError(lastError);
        }
        
        throw new ApiServiceError("All API endpoints are unavailable", 503);
    }

    // Image utility methods
    validateImageData(imageData: UploadedImageData): ImageUploadError | null {
        // Check if base64 data is valid
        if (!imageData.base64.startsWith('data:image/')) {
            return {
                type: 'invalid_type',
                message: 'Invalid image data format'
            };
        }

        // More accurate size calculation for base64
        const base64Data = imageData.base64.split(',')[1] || imageData.base64;
        const sizeInBytes = base64Data.length;
        const maxSize = 2 * 1024 * 1024; // 2MB for base64 string
        
        if (sizeInBytes > maxSize) {
            return {
                type: 'file_too_large',
                message: `Compressed image is still too large (${Math.round(sizeInBytes / 1024)}KB). Maximum allowed: ${Math.round(maxSize / 1024)}KB`
            };
        }

        // Check content type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(imageData.contentType)) {
            return {
                type: 'invalid_type',
                message: 'Invalid image type. Supported: JPEG, PNG, GIF, WebP'
            };
        }

        return null;
    }

    // Admin Methods (require authentication)

    async createPost(data: BlogPostFormData): Promise<BlogPost> {
        try {
            console.log("Creating blog post with data size:", {
                title: data.title?.length || 0,
                content: data.content?.length || 0,
                hasUploadedImage: !!data.uploaded_image,
                imageSize: data.uploaded_image ? `${Math.round(data.uploaded_image.length / 1024)}KB` : 'N/A'
            });
            
            // Validate uploaded image if present
            if (data.uploaded_image && data.uploaded_image_filename && data.uploaded_image_content_type) {
                const imageData: UploadedImageData = {
                    base64: data.uploaded_image,
                    filename: data.uploaded_image_filename,
                    contentType: data.uploaded_image_content_type,
                    size: data.uploaded_image.length
                };
                
                const validationError = this.validateImageData(imageData);
                if (validationError) {
                    throw new Error(`Image validation failed: ${validationError.message}`);
                }
            }
            
            const response: AxiosResponse<BlogPostResponse> = await this.api.post("/api/blog", data);
            console.log("Blog post created successfully:", response.data);
            return response.data.data;
        } catch (error) {
            console.error("Error creating blog post:", error);
            const axiosError = error as AxiosError;
            
            // Handle specific error types
            if (axiosError.response?.status === 413) {
                throw new Error("Image file is too large. Please compress the image and try again.");
            }
            
            if (axiosError.response?.status === 400) {
                const errorData = axiosError.response.data as any;
                if (errorData.message && errorData.message.includes('too large')) {
                    throw new Error("Request payload too large. Please use a smaller image.");
                }
                throw new Error(errorData.message || "Invalid request data");
            }
            
            // Try alternative endpoint if primary fails with 404
            if (axiosError.response?.status === 404) {
                try {
                    const response: AxiosResponse<BlogPostResponse> = await this.api.post("/blog", data);
                    console.log("Blog post created via alternative endpoint:", response.data);
                    return response.data.data;
                } catch (altError) {
                    console.error("Alternative endpoint also failed:", altError);
                    throw altError;
                }
            }
            
            throw error;
        }
    }

    async updatePost(id: string, data: Partial<BlogPostFormData>): Promise<BlogPost> {
        try {
            console.log("Updating blog post:", id, {
                hasUploadedImage: !!data.uploaded_image,
                imageSize: data.uploaded_image ? `${Math.round(data.uploaded_image.length / 1024)}KB` : 'N/A'
            });
            
            // Validate uploaded image if present
            if (data.uploaded_image && data.uploaded_image_filename && data.uploaded_image_content_type) {
                const imageData: UploadedImageData = {
                    base64: data.uploaded_image,
                    filename: data.uploaded_image_filename,
                    contentType: data.uploaded_image_content_type,
                    size: data.uploaded_image.length
                };
                
                const validationError = this.validateImageData(imageData);
                if (validationError) {
                    throw new Error(`Image validation failed: ${validationError.message}`);
                }
            }
            
            const response: AxiosResponse<BlogPostResponse> = await this.api.patch(`/api/blog/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error("Error updating blog post:", error);
            const axiosError = error as AxiosError;
            
            // Handle specific error types
            if (axiosError.response?.status === 413) {
                throw new Error("Image file is too large. Please compress the image and try again.");
            }
            
            if (axiosError.response?.status === 400) {
                const errorData = axiosError.response.data as any;
                if (errorData.message && errorData.message.includes('too large')) {
                    throw new Error("Request payload too large. Please use a smaller image.");
                }
                throw new Error(errorData.message || "Invalid request data");
            }
            
            if (axiosError.response?.status === 404) {
                try {
                    const response: AxiosResponse<BlogPostResponse> = await this.api.patch(`/blog/${id}`, data);
                    return response.data.data;
                } catch (altError) {
                    throw altError;
                }
            }
            
            throw error;
        }
    }

    async deletePost(id: string): Promise<void> {
        try {
            await this.api.delete(`/api/blog/${id}`);
            return;
        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axiosError.response?.status === 404) {
                try {
                    await this.api.delete(`/blog/${id}`);
                    return;
                } catch (altError) {
                    throw altError;
                }
            }
            
            console.error("Error deleting blog post:", error);
            throw error;
        }
    }

    async getAllPosts(query?: BlogPostQuery): Promise<{ posts: BlogPost[]; count: number; totalPages: number }> {
        try {
            const params = new URLSearchParams();
            
            if (query?.page) params.append("page", query.page.toString());
            if (query?.limit) params.append("limit", query.limit.toString());
            if (query?.search) params.append("search", query.search);
            if (query?.isPublished !== undefined) params.append("isPublished", query.isPublished.toString());
            if (query?.isFeatured !== undefined) params.append("isFeatured", query.isFeatured.toString());

            const queryString = params.toString();
            const endpoint = queryString ? `/api/blog?${queryString}` : "/api/blog";
            
            const response: AxiosResponse<BlogResponse> = await this.api.get(endpoint);
            return {
                posts: response.data.data,
                count: response.data.count || 0,
                totalPages: Math.ceil((response.data.count || 0) / (query?.limit || 10)),
            };
        } catch (error) {
            console.error("Error fetching all posts:", error);
            const axiosError = error as AxiosError;
            
            if (axiosError.response?.status === 404) {
                try {
                    const queryString = new URLSearchParams();
                    if (query?.page) queryString.append("page", query.page.toString());
                    if (query?.limit) queryString.append("limit", query.limit.toString());
                    if (query?.search) queryString.append("search", query.search);
                    if (query?.isPublished !== undefined) queryString.append("isPublished", query.isPublished.toString());
                    if (query?.isFeatured !== undefined) queryString.append("isFeatured", query.isFeatured.toString());

                    const qs = queryString.toString();
                    const endpoint = qs ? `/blog?${qs}` : "/blog";
                    
                    const response: AxiosResponse<BlogResponse> = await this.api.get(endpoint);
                    return {
                        posts: response.data.data,
                        count: response.data.count || 0,
                        totalPages: Math.ceil((response.data.count || 0) / (query?.limit || 10)),
                    };
                } catch (altError) {
                    throw altError;
                }
            }
            
            throw error;
        }
    }

    async getPostById(id: string): Promise<BlogPost> {
        try {
            const response: AxiosResponse<BlogPostResponse> = await this.api.get(`/api/blog/${id}`);
            return response.data.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axiosError.response?.status === 404) {
                try {
                    const response: AxiosResponse<BlogPostResponse> = await this.api.get(`/blog/${id}`);
                    return response.data.data;
                } catch (altError) {
                    throw altError;
                }
            }
            
            console.error("Error fetching post by ID:", error);
            throw error;
        }
    }

    async getStatistics(): Promise<BlogStatistics> {
        try {
            const response = await this.api.get("/api/blog/statistics");
            return response.data.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            
            if (axiosError.response?.status === 404) {
                try {
                    const response = await this.api.get("/blog/statistics");
                    return response.data.data;
                } catch (altError) {
                    throw altError;
                }
            }
            
            console.error("Error fetching blog statistics:", error);
            throw error;
        }
    }

    // Public Methods (no authentication required)

    async getPublishedPosts(): Promise<BlogPost[]> {
        try {
            const endpoints = ["/api/blog/published", "/blog/published"];
            const response = await this.tryApiEndpoints<BlogResponse>(endpoints);
            return response.data || [];
        } catch (error) {
            console.error("Error fetching published posts after trying all endpoints:", error);
            return [];
        }
    }

    async getFeaturedPosts(limit?: number): Promise<BlogPost[]> {
        try {
            const endpoints = [
                limit ? `/api/blog/featured?limit=${limit}` : "/api/blog/featured",
                limit ? `/blog/featured?limit=${limit}` : "/blog/featured"
            ];
            const response = await this.tryApiEndpoints<BlogResponse>(endpoints);
            return response.data || [];
        } catch (error) {
            console.error("Error fetching featured posts after trying all endpoints:", error);
            return [];
        }
    }

    async getRecentPosts(limit?: number): Promise<BlogPost[]> {
        try {
            const endpoints = [
                limit ? `/api/blog/recent?limit=${limit}` : "/api/blog/recent",
                limit ? `/blog/recent?limit=${limit}` : "/blog/recent"
            ];
            const response = await this.tryApiEndpoints<BlogResponse>(endpoints);
            return response.data || [];
        } catch (error) {
            console.error("Error fetching recent posts after trying all endpoints:", error);
            return [];
        }
    }

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        try {
            const endpoints = [`/api/blog/slug/${slug}`, `/blog/slug/${slug}`];
            const response = await this.tryApiEndpoints<BlogPostResponse>(endpoints);
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            if (apiError.statusCode === 404) {
                return null;
            }
            console.error("Error fetching post by slug:", error);
            return null;
        }
    }

    async incrementViewCount(slug: string): Promise<number> {
        try {
            const endpoints = [
                `/api/blog/slug/${slug}/view`,
                `/blog/slug/${slug}/view`
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await this.publicApi.post(endpoint);
                    return response.data.view_count || 0;
                } catch (error) {
                    const axiosError = error as AxiosError;
                    if (axiosError.response?.status !== 404) {
                        console.warn(`Unexpected error from ${endpoint}:`, error);
                    }
                }
            }
            
            console.warn("All view count increment endpoints failed");
            return 0;
        } catch (error) {
            console.error("Error incrementing view count:", error);
            return 0;
        }
    }

    async searchPosts(searchTerm: string, onlyPublished: boolean = true): Promise<BlogPost[]> {
        try {
            const params = new URLSearchParams();
            params.append("q", searchTerm);
            if (onlyPublished !== undefined) {
                params.append("published", onlyPublished.toString());
            }

            const endpoints = [
                `/api/blog/search?${params.toString()}`,
                `/blog/search?${params.toString()}`
            ];
            const response = await this.tryApiEndpoints<BlogResponse>(endpoints);
            return response.data || [];
        } catch (error) {
            console.error("Error searching posts after trying all endpoints:", error);
            return [];
        }
    }

    async getPublishedCount(): Promise<number> {
        try {
            const endpoints = ["/api/blog/published", "/blog/published"];
            const response = await this.tryApiEndpoints<BlogResponse>(endpoints);
            return response.count || 0;
        } catch (error) {
            console.error("Error fetching published count:", error);
            return 0;
        }
    }

    // Utility Methods

    formatDate(dateString: string): string {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        } catch (error) {
            return "Invalid date";
        }
    }

    formatDateTime(dateString: string): string {
        try {
            return new Date(dateString).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (error) {
            return "Invalid date";
        }
    }

    getExcerpt(post: BlogPost, maxLength: number = 150): string {
        if (post.excerpt) {
            return post.excerpt;
        }

        // Strip HTML tags and extract text content
        const plainText = post.content.replace(/<[^>]*>/g, "");
        if (plainText.length <= maxLength) {
            return plainText;
        }

        return plainText.substring(0, maxLength).trim() + "...";
    }

    getAuthorName(post: BlogPost): string {
        if (!post.author) {
            return "Unknown Author";
        }
        return `${post.author.first_name} ${post.author.last_name}`;
    }

    getAuthorInitials(post: BlogPost): string {
        if (!post.author) {
            return "UA";
        }
        return `${post.author.first_name.charAt(0)}${post.author.last_name.charAt(0)}`;
    }

    validateImageUrl(url: string): boolean {
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
        } catch {
            return false;
        }
    }

    truncateTitle(title: string, maxLength: number = 60): string {
        if (title.length <= maxLength) {
            return title;
        }
        return title.substring(0, maxLength).trim() + "...";
    }

    generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // Remove special characters
            .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    }

    isPostPublished(post: BlogPost): boolean {
        return post.is_published && !!post.published_at;
    }

    getReadingTime(content: string): number {
        // Average reading speed: 225 words per minute
        const wordsPerMinute = 225;
        const wordCount = content.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        return Math.max(1, readingTime);
    }

    formatReadingTime(content: string): string {
        const minutes = this.getReadingTime(content);
        return `${minutes} min read`;
    }

    formatViewCount(viewCount: number): string {
        if (viewCount < 1000) {
            return viewCount.toString();
        } else if (viewCount < 1000000) {
            return `${(viewCount / 1000).toFixed(1)}k`;
        } else {
            return `${(viewCount / 1000000).toFixed(1)}M`;
        }
    }

    // Image utility methods
    getMainImage(post: BlogPost): string | null {
        // Prioritize uploaded image over featured image
        return post.uploaded_image || post.featured_image || null;
    }

    hasMainImage(post: BlogPost): boolean {
        return !!(post.uploaded_image || post.featured_image);
    }

    getImageAlternative(post: BlogPost): string {
        if (post.uploaded_image_filename) {
            return post.uploaded_image_filename;
        }
        return `Image for ${post.title}`;
    }

    // Convert base64 to blob URL for better performance (optional)
    createImageBlobUrl(base64: string): string {
        try {
            const byteCharacters = atob(base64.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray]);
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error creating blob URL:', error);
            return base64; // Fallback to base64
        }
    }

    // Format file size for display
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Estimate compressed size
    estimateCompressedSize(originalSize: number): string {
        // Rough estimation: 30-70% reduction depending on image content
        const estimatedSize = originalSize * 0.5; // 50% reduction estimate
        return this.formatFileSize(estimatedSize);
    }
}

export const blogService = new BlogService();