import axios, { AxiosInstance, AxiosResponse, AxiosError, isAxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { Content } from "next/font/google";

export enum BlogCategory {
    NEWSROOM = "newsroom",
    THOUGHT_PIECES = "thought-pieces",
    ACHIEVEMENTS = "achievements",
    AWARDS_RECOGNITION = "awards-recognition"
}

export interface BlogAuthor {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface BlogPostRaw {
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
    categories: BlogCategory[] | string;
    author: BlogAuthor;
    created_at: string;
    updated_at: string;
    published_at?: string;
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
    categories: BlogCategory[];
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
    categories: BlogCategory[];
}

export interface BlogResponse {
    status_code: number;
    message: string;
    data: BlogPostRaw[];
    count?: number;
}

export interface BlogPostResponse {
    status_code: number;
    message: string;
    data: BlogPostRaw;
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

export interface APIError {
    message: string;
    status_code: number;
    error?: string;
    details?: unknown;
}

export interface BlogPostQuery {
    page?: number;
    limit?: number;
    search?: string;
    is_published?: boolean;
    is_featured?: boolean;
    categories?: BlogCategory[];
}

export interface ImageUploadError {
    type: "file_too_large" | "invalid_type" | "upload_failed" | "processing_failed";
    message: string;
}

export interface UploadedImageData {
    base64: string;
    filename: string;
    content_type: string;
    size: number;
}

interface APIErrorResponse {
    message?: string;
    error?: string;
    status_code?: number;
    details?: unknown;
}

interface LoggingContext {
    [key: string]: unknown;
}

function isStringCategories(categories: BlogCategory[] | string | null | undefined): categories is string {
    return typeof categories === "string";
}

function isArrayCategories(categories: BlogCategory[] | string | null | undefined): categories is BlogCategory[] {
    return Array.isArray(categories);
}

function normalizeCategories(categories: BlogCategory[] | string | null | undefined): BlogCategory[] {
    if (!categories) {
        return [BlogCategory.NEWSROOM];
    }

    if (isStringCategories(categories)) {
        if (categories === "" || categories === "{}" || categories === "null" || categories === "undefined") {
            return [BlogCategory.NEWSROOM];
        }

        const parsed = categories
            .split(",")
            .map(cat => cat.trim() as BlogCategory)
            .filter(cat => cat && Object.values(BlogCategory).includes(cat));
        
        return parsed.length > 0 ? parsed : [BlogCategory.NEWSROOM];
    }

    if (isArrayCategories(categories)) {
        const filtered = categories.filter(cat => cat && Object.values(BlogCategory).includes(cat));
        return filtered.length > 0 ? filtered : [BlogCategory.NEWSROOM];
    }

    return [BlogCategory.NEWSROOM];
}

function processBlogPost(rawPost: BlogPostRaw): BlogPost {
    return {
        ...rawPost,
        categories: normalizeCategories(rawPost.categories)
    };
}

function processBlogPosts(rawPosts: BlogPostRaw[]): BlogPost[] {
    return rawPosts.map(rawPost => processBlogPost(rawPost));
}

const logErrorDetails = (context: string, error: unknown): void => {
    console.group(`🔴 ${context}`);

    try {
        if (isAxiosError(error)) {
            const axiosErrorDetails: LoggingContext = {
                message: error.message || "No message",
                code: error.code || "No code",
                status: error.response?.status || "No status",
                statusText: error.response?.statusText || "No status text",
                url: error.config?.url || "No URL",
                method: error.config?.method || "No method",
                baseURL: error.config?.baseURL || "No base URL",
                responseData: error.response?.data || "No response data",
                requestData: error.config?.data || "No request data",
                headers: error.config?.headers || "No headers"
            };

            console.error("Axios Error Details:", axiosErrorDetails);
            console.error("Raw Axios Error:", error);
        } else if (error instanceof Error) {
            const standardErrorDetails: LoggingContext = {
                name: error.name || "No name",
                message: error.message || "No message",
                stack: error.stack || "No stack trace"
            };

            console.error("Standard Error:", standardErrorDetails);
            console.error("Raw Error Object:", error);
        } else if (error && typeof error === "object" && error !== null) {
            const objectErrorDetails: LoggingContext = {
                type: typeof error,
                constructor: (error as Record<string, unknown>).constructor?.name || "Unknown",
                keys: Object.keys(error as Record<string, unknown>),
                stringified: JSON.stringify(error),
                valueOf: String(error)
            };
            
            console.error("Object Error:", objectErrorDetails);
            console.error("Raw Error Object:", error);
        } else {
            const primitiveErrorDetails: LoggingContext = {
                type: typeof error,
                value: error,
                stringified: String(error)
            };
            
            console.error("Primitive Error:", primitiveErrorDetails);
        }
    } catch (loggingError: unknown) {
        console.error("Error while logging error:", loggingError);
        console.error("Original error (fallback):", error);
    }
    console.groupEnd();
};

class BlogService {
    private api: AxiosInstance;
    private publicAPI: AxiosInstance;
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        console.log("🚀 Initializing BlogService with baseURL:", this.baseURL);

        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 60000,
            headers: {
                "Content-Type": "application/json"
            },
            maxContentLength: 10 * 1024 * 1024,
            maxBodyLength: 10 * 1024 * 1024
        });

        this.publicAPI = axios.create({
            baseURL: this.baseURL,
            timeout: 60000,
            headers: {
                "Content-Type": "application/json"
            },
            maxContentLength: 10 * 1024 * 1024,
            maxBodyLength: 10 * 1024 * 1024
        })

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.api.interceptors.request.use(
            (config) => {
                const token = this.getStoredToken();
                if (token && config.headers) {
                    config.headers.Authorization =  `Bearer ${token}`;
                }

                const requestInformation: LoggingContext = {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    baseURL: config.baseURL,
                    fullURL: `${config.baseURL || ""}${config.url || ""}`,
                    hasToken: !!token,
                    hasData: !!config.data,
                    dataSize: config.data ? JSON.stringify(config.data).length : 0
                }

                console.log("📤 API Request:", requestInformation);
                return config;
            },
            (error: unknown) => {
                logErrorDetails("Request Interceptor Error", error);
                return Promise.reject(error);
            }
        );

        const handleResponse = (response: AxiosResponse): AxiosResponse => {
            const responseInformation: LoggingContext = {
                status: response.status,
                statusText: response.statusText,
                url: response.config.url,
                dataSize: response.data ? JSON.stringify(response.data).length : 0
            };

            console.log("📥 API Response:", responseInformation);
            return response;
        };

        const handleError = (error: unknown): Promise<never> => {
            console.log("🚨 Interceptor caught error:", typeof error, error);

            logErrorDetails("API Response Error", error);

            if (isAxiosError(error) && error.response?.status !== 404) {
                const errorDetails: LoggingContext = {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                    fullURL: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
                    message: error.message,
                    code: error.code,
                    data: error.response?.data,
                    timeout: error.config?.timeout
                };
                console.error("🚨 Non-404 API Error Details:", errorDetails);
            }

            if (isAxiosError(error) && error.response?.status === 401) {
                this.handleUnauthorized();
            }

            const formattedError = this.formatError(error);
            console.log("🔄 Formatted error:", formattedError);
            return Promise.reject(formattedError);
        };

        this.api.interceptors.response.use(handleResponse, handleError);
        this.publicAPI.interceptors.response.use(handleResponse, handleError);
    }

    private getStoredToken(): string | null {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("adminToken");
            return token;
        }
        return null;
    }

    private handleUnauthorized(): void {
        console.warn("🚫 Unauthorized access - clearing auth data");
        if (typeof window !== "undefined") {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminData");
            window.location.href = "/login";
        }
    }

    private formatError(error: unknown): APIError {
        console.log("🔧 Formatting error:", typeof error, error);

        if (isAxiosError(error)) {
            if (error.response?.data) {
                const data = error.response.data as APIErrorResponse;
                return {
                    message: data.message || error.message || "An error occurred",
                    status_code: error.response.status,
                    error: data.error,
                    details: data.details || data
                };
            }

            if (error.code === "ECONNABORTED") {
                return {
                    message: "Request timeout - please check if the backend server is running or try a smaller image",
                    status_code: 408,
                };
            }

            if (error.code === "ECONNREFUSED") {
                return {
                    message: "Connection refused - backend server may not be running",
                    status_code: 503,
                };
            }

            if (error.message?.includes("Network Error")) {
                return {
                    message: "Network error - please check your connection and ensure the backend server is running",
                    status_code: 0,
                };
            }

            return {
                message: error.message || "Network error",
                status_code: error.response?.status || 500,
            };
        }

        if (error instanceof Error) {
            return {
                message: error.message || "An unexpected error occurred",
                status_code: 500,
                details: { name: error.name, stack: error.stack }
            }
        }

        return {
            message: "An unknown error occurred",
            status_code: 500,
            details: { errorType: typeof error, error: String(error) }
        };
    }

    private async tryAPIEndpoints<T>(endpoints: string[], method: "GET" | "POST" = "GET", data?: unknown): Promise<T> {
        let lastError: unknown = null;
        const attemptedEndpoints: string[] = [];
        
        for (const endpoint of endpoints) {
            try {
                let response: AxiosResponse<T>;

                if (method === "POST") {
                    response = await this.publicAPI.post(endpoint, data);
                } else {
                    response = await this.publicAPI.get(endpoint);
                }
                return response.data;
            } catch (error: unknown) {
                lastError = error;
                attemptedEndpoints.push(endpoint);
                
                if (isAxiosError(error) && error.response?.status !== 404) {
                    console.warn(`Unexpected error from ${endpoint}:`, error);
                }
            }
        }
        console.warn(`All API endpoints failed. Attempted: ${attemptedEndpoints.join(", ")}`);
        
        if (lastError) {
            throw lastError;
        }
        
        throw new Error("All API endpoints are unavailable");
    }

    validateImageData(imageData: UploadedImageData): ImageUploadError | null {
        const imageInformation: LoggingContext = {
            size: imageData.size,
            content_type: imageData.content_type,
            filename: imageData.filename
        };

        console.log("🖼️ Validating image data:", imageInformation);

        if (!imageData.base64.startsWith("data:image/")) {
            return {
                type: "invalid_type",
                message: "Invalid image data format"
            };
        }

        const base64Data = imageData.base64.split(",")[1] || imageData.base64;
        const sizeInBytes = base64Data.length;
        const maxSize = 2 * 1024 * 1024;

        if (sizeInBytes > maxSize) {
            return {
                type: "file_too_large",
                message: `Compressed image is still too large (${Math.round(sizeInBytes / 1024)}KB). Maximum allowed: ${Math.round(maxSize / 1024)}KB`
            };
        }

        const validTypes: string[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(imageData.content_type)) {
            return {
                type: "invalid_type",
                message: "Invalid image type. Supported: JPEG, PNG, GIF, WEBP."
            };
        }
        return null;
    }

    async getPublishedPosts(): Promise<BlogPost[]> {
        try {
            console.log("🔍 Fetching published posts...");
            const endpoints = ["/api/blog/published", "/blog/published"];
            const response = await this.tryAPIEndpoints<BlogResponse>(endpoints);
            
            const rawPosts = response.data || [];
            console.log("📋 Raw published posts fetched:", rawPosts.length);
            
            const processedPosts = processBlogPosts(rawPosts);
            console.log("✅ Processed published posts:", processedPosts.length);
            
            return processedPosts;
        } catch (error: unknown) {
            console.error("❌ Error fetching published posts:", error);
            return [];
        }
    }

    async getFeaturedPosts(limit?: number): Promise<BlogPost[]> {
        try {
            console.log("🔍 Fetching featured posts...");
            const endpoints = [
                limit ? `/api/blog/featured?limit=${limit}` : "/api/blog/featured",
                limit ? `/blog/featured?limit=${limit}` : "/blog/featured"
            ];
            const response = await this.tryAPIEndpoints<BlogResponse>(endpoints);
            
            const rawPosts = response.data || [];
            console.log("📋 Raw featured posts fetched:", rawPosts.length);
            
            const processedPosts = processBlogPosts(rawPosts);
            console.log("✅ Processed featured posts:", processedPosts.length);
        
            return processedPosts;
        } catch (error: unknown) {
            console.error("❌ Error fetching featured posts:", error);
            return [];
        }
    }

    async getRecentPosts(limit?: number): Promise<BlogPost[]> {
        try {
            console.log("🔍 Fetching recent posts...");
            const endpoints = [
                limit ? `/api/blog/recent?limit=${limit}` : "/api/blog/recent",
                limit ? `/blog/recent?limit=${limit}` : "/blog/recent"
            ];
            const response = await this.tryAPIEndpoints<BlogResponse>(endpoints);
            
            const rawPosts = response.data || [];
            console.log("📋 Raw recent posts fetched:", rawPosts.length);
            
            const processedPosts = processBlogPosts(rawPosts);
            console.log("✅ Processed recent posts:", processedPosts.length);
            
            return processedPosts;
        } catch (error: unknown) {
            console.error("❌ Error fetching recent posts:", error);
            return [];
        }
    }

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        try {
            console.log(`🔍 Fetching post by slug: ${slug}`);
            const endpoints = [`/api/blog/slug/${slug}`, `/blog/slug/${slug}`];
            const response = await this.tryAPIEndpoints<BlogPostResponse>(endpoints);
            
            console.log(`📋 Raw post fetched by slug: ${slug}`);
            const processedPost = processBlogPost(response.data);
            console.log(`✅ Processed post by slug: ${slug}`);
            
            return processedPost;
        } catch (error: unknown) {
            const apiError = error as ApiError;
            if (apiError.statusCode === 404) {
                console.log(`ℹ️ Post not found with slug: ${slug}`);
                return null;
            }
            console.error(`❌ Error fetching post by slug ${slug}:`, error);
            return null;
        }
    }

    async incrementViewCount(slug: string): Promise<number> {
        try {
            console.log(`🔍 Incrementing view count for: ${slug}`);
            const endpoints = [
                `/api/blog/slug/${slug}/view`,
                `/blog/slug/${slug}/view`
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response: AxiosResponse<{ view_count: number }> = await this.publicAPI.post(endpoint);
                    console.log(`✅ View count incremented for ${slug}:`, response.data.view_count);
                    return response.data.view_count || 0;
                } catch (error: unknown) {
                    if (isAxiosError(error) && error.response?.status !== 404) {
                        console.warn(`Unexpected error from ${endpoint}:`, error);
                    }
                }
            }
            
            console.warn("All view count increment endpoints failed");
            return 0;
        } catch (error: unknown) {
            console.error("❌ Error incrementing view count:", error);
            return 0;
        }
    }

    async searchPosts(searchTerm: string, onlyPublished: boolean = true): Promise<BlogPost[]> {
        try {
            console.log(`🔍 Searching posts: "${searchTerm}"`);
            const params = new URLSearchParams();
            params.append("q", searchTerm);
            if (onlyPublished !== undefined) {
                params.append("published", onlyPublished.toString());
            }

            const endpoints = [
                `/api/blog/search?${params.toString()}`,
                `/blog/search?${params.toString()}`
            ];
            const response = await this.tryAPIEndpoints<BlogResponse>(endpoints);
            
            const rawPosts = response.data || [];
            console.log(`📋 Raw search results for "${searchTerm}":`, rawPosts.length);
            
            const processedPosts = processBlogPosts(rawPosts);
            console.log(`✅ Processed search results for "${searchTerm}":`, processedPosts.length);
            
            return processedPosts;
        } catch (error: unknown) {
            console.error(`❌ Error searching posts for "${searchTerm}":`, error);
            return [];
        }
    }

    private validateFormData(data: BlogPostFormData): BlogPostFormData {
        const validationInfo: LoggingContext = {
            title: data.title?.length || 0,
            content: data.content?.length || 0,
            categories: data.categories,
            categoriesType: typeof data.categories,
            categoriesArray: Array.isArray(data.categories),
            hasUploadedImage: !!data.uploaded_image,
            hasExcerpt: !!data.excerpt,
            hasFeaturedImage: !!data.featured_image
        };

        console.log("🔍 Validating form data:", validationInfo);

        let validCategories = data.categories;

        if (!validCategories) {
            console.warn("⚠️ No categories provided, using default NEWSROOM");
            validCategories = [BlogCategory.NEWSROOM];
        } else if (!Array.isArray(validCategories)) {
            console.warn("⚠️ Categories is not an array, converting to array:", validCategories);
            if (typeof validCategories === "string") {
                validCategories = [validCategories as BlogCategory];
            } else {
                validCategories = [BlogCategory.NEWSROOM];
            }
        } else if (validCategories.length === 0) {
            console.warn("⚠️ Empty categories array, using default NEWSROOM");
            validCategories = [BlogCategory.NEWSROOM];
        }

        const validCategoryValues = Object.values(BlogCategory);
        const filteredCategories = [...new Set(validCategories)].filter((cat): cat is BlogCategory => validCategoryValues.includes(cat));

        if (filteredCategories.length === 0) {
            console.warn("⚠️ All categories were invalid, using default NEWSROOM");
            filteredCategories.push(BlogCategory.NEWSROOM);
        }

        const validatedData: BlogPostFormData = {
            ...data,
            title: data.title?.trim() || "",
            content: data.content?.trim() || "",
            excerpt: data.excerpt?.trim() || undefined,
            categories: filteredCategories
        };

        const validatedInformation: LoggingContext = {
            title: validatedData.title.length,
            content: validatedData.content.length,
            categories: validatedData.categories,
            categoriesCount: validatedData.categories.length,
            hasExcerpt: !!validatedData.excerpt
        };
        
        console.log("✅ Validated data:", validatedInformation);
        return validatedData;
    }
    
    async createPost(data: BlogPostFormData): Promise<BlogPost> {
        console.group("🚀 Creating Blog Post");

        const validatedData = this.validateFormData(data);
        
        try {
            console.log("📋 Category validation:", {
                originalCategories: data.categories,
                validatedCategories: validatedData.categories,
                categoriesType: typeof validatedData.categories,
                categoriesArray: Array.isArray(validatedData.categories),
                categoriesLength: validatedData.categories?.length
            });

            if (validatedData.uploaded_image && validatedData.uploaded_image_filename && validatedData.uploaded_image_content_type) {
                console.log("🖼️ Validating uploaded image...");
                const imageData: UploadedImageData = {
                    base64: validatedData.uploaded_image,
                    filename: validatedData.uploaded_image_filename,
                    content_type: validatedData.uploaded_image_content_type,
                    size: validatedData.uploaded_image.length
                };
                
                const validationError = this.validateImageData(imageData);
                if (validationError) {
                    throw new Error(`Image validation failed: ${validationError.message}`);
                }
                console.log("✅ Image validation passed");
            }
            console.log("📤 Sending POST request to /api/blog");
            console.log("📦 Request payload:", {
                title: validatedData.title,
                categories: validatedData.categories,
                payloadSize: JSON.stringify(validatedData).length + " bytes"
            });

            const response: AxiosResponse<BlogPostResponse> = await this.api.post("/api/blog", validatedData);

            const processedPost = processBlogPost(response.data.data);

            const successInformation: LoggingContext = {
                id: processedPost.id,
                title: processedPost.title,
                categories: processedPost.categories,
                final_categories_count: processedPost.categories.length
            };
            console.log("✅ Blog post created successfully:", successInformation);
            console.groupEnd();
            return processedPost;
        } catch (error: unknown) {
            console.groupEnd();
            console.error("🚨 Raw createPost error:", error);
            logErrorDetails("Blog Post Creation Failed", error);

            if (isAxiosError(error)) {
                if (error.response?.status === 413) {
                    throw new Error("Image file is too large. Please compress the image and try again.");
                }
                
                if (error.response?.status === 400) {
                    const errorData = error.response.data as APIErrorResponse;
                    if (errorData?.message && errorData.message.includes("too large")) {
                        throw new Error("Request payload too large. Please use a smaller image.");
                    }
                    throw new Error(errorData?.message || "Invalid request data. Please check your form inputs.");
                }
    
                if (error.response?.status === 401) {
                    throw new Error("Authentication failed. Please log in again.");
                }
    
                if (error.response?.status === 403) {
                    throw new Error("You don't have permission to create blog posts.");
                }
    
                if (error.response?.status === 500) {
                    throw new Error("Server error. Please try again later or contact support.");
                }
                
                // Try alternative endpoint if primary fails with 404
                if (error.response?.status === 404) {
                    console.log("🔄 Trying alternative endpoint /blog");
                    try {
                        const response: AxiosResponse<BlogPostResponse> = await this.api.post("/blog", validatedData);
                        console.log("✅ Blog post created via alternative endpoint");
                        return processBlogPost(response.data.data);
                    } catch (altError: unknown) {
                        logErrorDetails("Alternative Endpoint Failed", altError);
                        throw new Error("Blog creation endpoint not found. Please check your API configuration.");
                    }
                }
    
                if (error.code === "ECONNREFUSED") {
                    throw new Error("Cannot connect to the server. Please ensure the backend is running and accessible.");
                }
    
                if (error.code === "ECONNABORTED") {
                    throw new Error("Request timed out. Please try with a smaller image or check your connection.");
                }
    
                throw new Error(error.message || "Network error occurred while creating the blog post.");
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("An unexpected error occurred while creating the blog post.");
        }
    }

    async getPostsByCategory(category: BlogCategory): Promise<BlogPost[]> {
        try {
            console.log(`🔍 Frontend: Fetching posts for category: ${category}`);

            const endpoints = [
                `/api/blog/category/${category}`,
                `/blog/category/${category}`
            ];

            const response = await this.tryAPIEndpoints<BlogResponse>(endpoints);
            const rawPosts = response.data || [];
            console.log(`📋 Frontend: Raw category posts fetched for ${category}:`, rawPosts.length);

            const processedPosts = processBlogPosts(rawPosts);

            const filteredPosts = processedPosts.filter(post => {
                const hasCategory = post.categories.includes(category);
                const isPublished = post.is_published;
                
                console.log(`📝 Frontend: Post "${post.title}": categories=[${post.categories.join(", ")}], has ${category}: ${hasCategory}, published: ${isPublished}`);
                
                if (!hasCategory) {
                    console.warn(`⚠️ Frontend: Post "${post.title}" doesn"t contain category ${category}, has:`, post.categories);
                }
                
                if (!isPublished) {
                    console.warn(`⚠️ Frontend: Post "${post.title}" is not published`);
                }
                
                return hasCategory && isPublished;
            });

            console.log(`✅ Frontend: Filtered posts for ${category}:`, filteredPosts.length);

            if (filteredPosts.length > 0) {
                filteredPosts.slice(0, 3).forEach(post => {
                    console.log(`📄 Sample post: "${post.title}" - categories: [${post.categories.join(", ")}]`);
                });
            } else {
                console.warn(`⚠️ No posts found for category ${category}. This might indicate a backend issue.`);
            }
            return filteredPosts;
        } catch (error: unknown) {
            console.error(`❌ Frontend: Error fetching posts for category ${category}:`, error);
            return [];
        }
    }

    async updatePost(id: string, data: Partial<BlogPostFormData>): Promise<BlogPost> {
        try {
            console.log("📝 Updating blog post:", id);
            
            if (data.uploaded_image && data.uploaded_image_filename && data.uploaded_image_content_type) {
                const imageData: UploadedImageData = {
                    base64: data.uploaded_image,
                    filename: data.uploaded_image_filename,
                    content_type: data.uploaded_image_content_type,
                    size: data.uploaded_image.length
                };
                
                const validationError = this.validateImageData(imageData);
                if (validationError) {
                    throw new Error(`Image validation failed: ${validationError.message}`);
                }
            }
            
            const response: AxiosResponse<BlogPostResponse> = await this.api.patch(`/api/blog/${id}`, data);
            console.log("✅ Blog post updated successfully");
            
            return processBlogPost(response.data.data);
        } catch (error: unknown) {
            console.error("❌ Error updating blog post:", error);
            
            if (isAxiosError(error)) {
                if (error.response?.status === 413) {
                    throw new Error("Image file is too large. Please compress the image and try again.");
                }
                
                if (error.response?.status === 400) {
                    const errorData = error.response.data as APIErrorResponse;
                    if (errorData.message && errorData.message.includes("too large")) {
                        throw new Error("Request payload too large. Please use a smaller image.");
                    }
                    throw new Error(errorData.message || "Invalid request data");
                }
                
                if (error.response?.status === 404) {
                    try {
                        const response: AxiosResponse<BlogPostResponse> = await this.api.patch(`/blog/${id}`, data);
                        return processBlogPost(response.data.data);
                    } catch (alternativeError: unknown) {
                        throw alternativeError;
                    }
                }
            }
            throw error;
        }
    }

    async deletePost(id: string): Promise<void> {
        try {
            console.log("🗑️ Deleting blog post:", id);
            await this.api.delete(`/api/blog/${id}`);
            console.log("✅ Blog post deleted successfully");
            return;
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.status === 404) {
                try {
                    await this.api.delete(`/blog/${id}`);
                    console.log("✅ Blog post deleted via alternative endpoint");
                    return;
                } catch (altError: unknown) {
                    throw altError;
                }
            }
            console.error("❌ Error deleting blog post:", error);
            throw error;
        }
    }

    async getAllPosts(query?: BlogPostQuery): Promise<{ posts: BlogPost[]; count: number; total_pages: number }> {
        try {
            console.log("🔍 Fetching all posts with query:", query);
            const params = new URLSearchParams();
            
            if (query?.page) params.append("page", query.page.toString());
            if (query?.limit) params.append("limit", query.limit.toString());
            if (query?.search) params.append("search", query.search);
            if (query?.is_published !== undefined) params.append("isPublished", query.is_published.toString());
            if (query?.is_featured !== undefined) params.append("isFeatured", query.is_featured.toString());
            if (query?.categories && query.categories.length > 0) {
                query.categories.forEach(category => params.append("categories", category));
            }

            const queryString = params.toString();
            const endpoint = queryString ? `/api/blog?${queryString}` : "/api/blog";
            
            const response: AxiosResponse<BlogResponse> = await this.api.get(endpoint);
            
            const rawPosts = response.data.data;
            const processedPosts = processBlogPosts(rawPosts);
            
            console.log("✅ All posts fetched:", processedPosts.length);
            
            return {
                posts: processedPosts,
                count: response.data.count || 0,
                total_pages: Math.ceil((response.data.count || 0) / (query?.limit || 10)),
            };
        } catch (error: unknown) {
            console.error("❌ Error fetching all posts:", error);
            
            if (isAxiosError(error) && error.response?.status === 404) {
                try {
                    const params = new URLSearchParams();
                    if (query?.page) params.append("page", query.page.toString());
                    if (query?.limit) params.append("limit", query.limit.toString());
                    if (query?.search) params.append("search", query.search);
                    if (query?.is_published !== undefined) params.append("isPublished", query.is_published.toString());
                    if (query?.is_featured !== undefined) params.append("isFeatured", query.is_featured.toString());
                    if (query?.categories && query.categories.length > 0) {
                        query.categories.forEach(category => params.append("categories", category));
                    }

                    const qs = params.toString();
                    const endpoint = qs ? `/blog?${qs}` : "/blog";
                    
                    const response: AxiosResponse<BlogResponse> = await this.api.get(endpoint);
                    const rawPosts = response.data.data;
                    const processedPosts = processBlogPosts(rawPosts);
                    
                    return {
                        posts: processedPosts,
                        count: response.data.count || 0,
                        total_pages: Math.ceil((response.data.count || 0) / (query?.limit || 10)),
                    };
                } catch (altError: unknown) {
                    throw altError;
                }
            }
            throw error;
        }
    }

    async getPostByID(id: string): Promise<BlogPost> {
        try {
            console.log("🔍 Fetching post by ID:", id);
            const response: AxiosResponse<BlogPostResponse> = await this.api.get(`/api/blog/${id}`);
            console.log("✅ Post fetched by ID");
            return processBlogPost(response.data.data);
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.status === 404) {
                try {
                    const response: AxiosResponse<BlogPostResponse> = await this.api.get(`/blog/${id}`);
                    return processBlogPost(response.data.data);
                } catch (altError: unknown) {
                    throw altError;
                }
            }
            console.error("❌ Error fetching post by ID:", error);
            throw error;
        }
    }

    async getStatistics(): Promise<BlogStatistics> {
        try {
            console.log("📊 Fetching blog statistics");
            const response: AxiosResponse<{ data: BlogStatistics }> = await this.api.get("/api/blog/statistics");
            console.log("✅ Statistics fetched");
            return response.data.data;
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.status === 404) {
                try {
                    const response: AxiosResponse<{ data: BlogStatistics }> = await this.api.get("/blog/statistics");
                    return response.data.data;
                } catch (altError: unknown) {
                    throw altError;
                }
            }
            console.error("❌ Error fetching blog statistics:", error);
            throw error;
        }
    }

    getCategoryLabel(category: BlogCategory): string {
        const labels: Record<BlogCategory, string> = {
            [BlogCategory.NEWSROOM]: "Newsroom",
            [BlogCategory.THOUGHT_PIECES]: "Thought Pieces",
            [BlogCategory.ACHIEVEMENTS]: "Achievements",
            [BlogCategory.AWARDS_RECOGNITION]: "Awards & Recognition"
        };
        return labels[category] || category;
    }

    getCategoryPath(category: BlogCategory): string {
        const paths: Record<BlogCategory, string> = {
            [BlogCategory.NEWSROOM]: "/newsroom",
            [BlogCategory.THOUGHT_PIECES]: "/newsroom/thought-pieces",
            [BlogCategory.ACHIEVEMENTS]: "/newsroom/achievements",
            [BlogCategory.AWARDS_RECOGNITION]: "/newsroom/awards-recognition"
        };
        return paths[category] || "/newsroom";
    }

    getCategoryDescription(category: BlogCategory): string {
        const descriptions: Record<BlogCategory, string> = {
            [BlogCategory.NEWSROOM]: "Latest news and updates from our company",
            [BlogCategory.THOUGHT_PIECES]: "In-depth analysis and thought leadership articles",
            [BlogCategory.ACHIEVEMENTS]: "Milestones, successes, and company achievements",
            [BlogCategory.AWARDS_RECOGNITION]: "Awards, recognitions, and industry accolades"
        };
        return descriptions[category] || "";
    }

    formatDate(dateString: string): string {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        } catch (error: unknown) {
            console.error("Error formatting date:", error);
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
        } catch (error: unknown) {
            console.error("Error formatting datetime:", error);
            return "Invalid date";
        }
    }

    getExcerpt(post: BlogPost, maxLength: number = 150): string {
        if (post.excerpt) {
            return post.excerpt;
        }
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

    validateImageURL(url: string): boolean {
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
        } catch (error: unknown) {
            console.error("Error validating image URL:", error);
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
            .replace(/[^\w\s-]/g, "")   // Remove special characters
            .replace(/[\s_-]+/g, "-")   // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, "");   // Remove leading/trailing hyphens
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

    getMainImage(post: BlogPost): string | null {
        return post.uploaded_image || post.featured_image || null;
    }

    hasMainImage(post: BlogPost): boolean {
        return !!(post.uploaded_image || post.featured_image);
    }

    getAlternativeImage(post: BlogPost): string {
        if (post.uploaded_image_filename) {
            return post.uploaded_image_filename;
        }
        return `Image for ${post.title}`;
    }

    createImageBlobURL(base64: string): string {
        try {
            const byteCharacters = atob(base64.split(",")[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray]);
            return URL.createObjectURL(blob);
        } catch (error: unknown) {
            console.error("Error creating blob URL:", error);
            return base64;
        }
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) {
            return "0 Bytes";
        }
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    estimateCompressedSize(originalSize: number): string {
        const estimatedSize = originalSize * 0.5;
        return this.formatFileSize(estimatedSize);
    }

    getPostCategories(post: BlogPost): BlogCategory[] {
        return post.categories;
    }

    hasCategory(post: BlogPost, category: BlogCategory): boolean {
        return post.categories.includes(category);
    }

    filterPostsByCategory(posts: BlogPost[], category: BlogCategory): BlogPost[] {
        return posts.filter(post => this.hasCategory(post, category));
    }

    async testConnection(): Promise<{ success: boolean; message: string; details?: unknown }> {
        console.log("🔗 Testing API connection...");
        
        try {
            const response: AxiosResponse<unknown> = await this.publicAPI.get("/health", { timeout: 5000 });
            return {
                success: true,
                message: "API connection successful",
                details: response.data
            };
        } catch (error: unknown) {
            logErrorDetails("Connection Test Failed", error);
            
            if (isAxiosError(error)) {
                if (error.code === "ECONNREFUSED") {
                    return {
                        success: false,
                        message: "Connection refused - backend server is not running",
                        details: { baseURL: this.baseURL, error: error.message }
                    };
                }
                
                if (error.code === "ECONNABORTED") {
                    return {
                        success: false,
                        message: "Connection timeout - backend server is not responding",
                        details: { baseURL: this.baseURL, timeout: error.config?.timeout }
                    };
                }
                
                return {
                    success: false,
                    message: `API error: ${error.message}`,
                    details: { 
                        status: error.response?.status,
                        baseURL: this.baseURL 
                    }
                };
            }
            return {
                success: false,
                message: "Unknown connection error",
                details: { error: String(error) }
            };
        }
    }
}

export const blogService = new BlogService();
export { normalizeCategories, processBlogPost, processBlogPosts };