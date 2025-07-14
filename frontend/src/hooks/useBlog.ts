import { blogService } from "@/services/blogService";
import { useState, useEffect, useCallback } from "react";
import { BlogPost, BlogPostFormData, BlogPostQuery, BlogStatistics, APIError, BlogCategory } from "@/services/blogService";

export interface UseBlogPostsReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    count: number;
    total_pages: number;
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

export interface UseBlogPostBySlugReturn {
    post: BlogPost | null;
    loading: boolean;
    error: string | null;
    notFound: boolean;
    refetch: () => Promise<void>;
}

export interface UsePublishedPostsReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface UseFeaturedPostsReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface UseRecentPostsReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface UseBlogStatisticsReturn {
    statistics: BlogStatistics | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface UseBlogSearchReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    searchPosts: (searchTerm: string, onlyPublished?: boolean) => Promise<void>;
    clearSearch: () => void;
}

const handleAPIError = (error: unknown): string => {
    console.group("🔴 API Error Handler");

    if (error && typeof error === "object" && "message" in error) {
        const apiError = error as APIError;
        console.log("API Error:", {
            message: apiError.message,
            status_code: apiError.status_code,
            error: apiError.error,
            details: apiError.details
        });
        console.groupEnd();
        return apiError.message || "An unexpected error occurred";
    }

    if (error instanceof Error) {
        console.log("Standard Error:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        console.groupEnd();
        return error.message;
    }

    if (typeof error === "string") {
        console.log("String Error:", error);
        console.groupEnd();
        return error;
    }
    
    console.warn("Unknown error type received:", {
        type: typeof error,
        value: error,
        stringified: JSON.stringify(error)
    });

    console.groupEnd();
    return "An unexpected error occurred";
};

export const useBlogPosts = (initialQuery?: BlogPostQuery): UseBlogPostsReturn => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (query?: BlogPostQuery): Promise<void> => {
        try {
            console.log("🔍 Fetching all posts with query:", query);
            setLoading(true);
            setError(null);
            
            const result = await blogService.getAllPosts(query);
            console.log("✅ Posts fetched successfully:", {
                posts_count: result.posts.length,
                total_count: result.count,
                total_pages: result.total_pages
            });
            
            setPosts(result.posts);
            setCount(result.count);
            setTotalPages(result.total_pages);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error fetching posts:", err);
            setError(errorMessage);
            setPosts([]);
            setCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const createPost = useCallback(async (data: BlogPostFormData): Promise<BlogPost> => {
        try {
            console.log("🚀 Creating new post:", { title: data.title, categories: data.categories });
            setError(null);
            
            const newPost = await blogService.createPost(data);
            console.log("✅ Post created successfully:", newPost.id);
            
            setPosts(prev => [newPost, ...prev]);
            setCount(prev => prev + 1);
            return newPost;
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error creating post:", err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const updatePost = useCallback(async (id: string, data: Partial<BlogPostFormData>): Promise<BlogPost> => {
        try {
            console.log("📝 Updating post:", id);
            setError(null);
            
            const updatedPost = await blogService.updatePost(id, data);
            console.log("✅ Post updated successfully:", id);
            
            setPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
            return updatedPost;
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error updating post:", err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const deletePost = useCallback(async (id: string): Promise<void> => {
        try {
            console.log("🗑️ Deleting post:", id);
            setError(null);
            
            await blogService.deletePost(id);
            console.log("✅ Post deleted successfully:", id);
            
            setPosts(prev => prev.filter(post => post.id !== id));
            setCount(prev => Math.max(0, prev - 1));
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error deleting post:", err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const refetch = useCallback(async (): Promise<void> => {
        console.log("🔄 Refetching posts...");
        await fetchPosts(initialQuery);
    }, [fetchPosts, initialQuery]);

    useEffect(() => {
        console.log("🎯 useBlogPosts hook initialized");
        fetchPosts(initialQuery);
    }, [fetchPosts, initialQuery]);

    return {
        posts,
        loading,
        error,
        count,
        total_pages: totalPages,
        refetch,
        createPost,
        updatePost,
        deletePost,
    };
};