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
            timeout: 15000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Public API instance without authentication
        this.publicApi = axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                "Content-Type": "application/json",
            },
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
                message: "Request timeout - please check if the backend server is running",
                statusCode: 408,
            };
        }

        if (error.code === "ECONNREFUSED") {
            return {
                message: "Connection refused - backend server may not be running",
                statusCode: 503,
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

    // Admin Methods (require authentication)

    async createPost(data: BlogPostFormData): Promise<BlogPost> {
        try {
            console.log("Creating blog post with data:", data);
            
            const response: AxiosResponse<BlogPostResponse> = await this.api.post("/api/blog", data);
            console.log("Blog post created successfully:", response.data);
            return response.data.data;
        } catch (error) {
            console.error("Error creating blog post:", error);
            const axiosError = error as AxiosError;
            
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
            console.log("Updating blog post:", id, data);
            
            const response: AxiosResponse<BlogPostResponse> = await this.api.patch(`/api/blog/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error("Error updating blog post:", error);
            const axiosError = error as AxiosError;
            
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
}

export const blogService = new BlogService();