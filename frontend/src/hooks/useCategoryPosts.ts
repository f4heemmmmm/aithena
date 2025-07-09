import { useState, useEffect, useCallback } from "react";

import { blogService } from "@/services/blogService";
import { 
    BlogPost, 
    BlogCategory,
    ApiError
} from "@/services/blogService";

export interface UseCategoryPostsReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// Enhanced error handler with better logging
const handleApiError = (error: unknown): string => {
    console.group("🔴 API Error Handler");
    
    // Handle custom ApiError type from blogService
    if (error && typeof error === "object" && "message" in error) {
        const apiError = error as ApiError;
        console.log("API Error:", {
            message: apiError.message,
            statusCode: apiError.statusCode,
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

// Helper hook for category-specific posts (public)
export const useCategoryPosts = (category: BlogCategory): UseCategoryPostsReturn => {
    const [loading, setLoading] = useState<boolean>(true);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (): Promise<void> => {
        try {
            console.log(`🔍 Fetching posts for category: ${category}`);
            setLoading(true);
            setError(null);
            
            const fetchedPosts = await blogService.getPostsByCategory(category);
            console.log(`✅ Category posts fetched for ${category}:`, fetchedPosts.length);
            
            // Additional validation: ensure posts actually contain the category
            const validPosts = fetchedPosts.filter(post => {
                if (!post.categories) return false;
                
                // Handle both array and single category formats
                const postCategories = Array.isArray(post.categories) 
                    ? post.categories 
                    : [post.categories];
                
                return postCategories.includes(category);
            });
            
            console.log(`📋 Valid posts after category validation: ${validPosts.length}`);
            setPosts(validPosts);
            
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            console.error(`❌ Error fetching posts for category ${category}:`, err);
            setError(errorMessage);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [category]);

    const refetch = useCallback(async (): Promise<void> => {
        console.log(`🔄 Refetching posts for category: ${category}`);
        await fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        if (category) {
            console.log(`🎯 useCategoryPosts hook initialized for: ${category}`);
            fetchPosts();
        }
    }, [fetchPosts, category]);

    return {
        posts,
        loading,
        error,
        refetch,
    };
};

export default useCategoryPosts;