import { blogService } from "@/services/blogService";
import { useState, useEffect, useCallback } from "react";
import { BlogPost, BlogCategory, APIError } from "@/services/blogService";

export interface UseCategoryPostsReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const handleAPIError = (error: unknown): string => {
    console.group("🔴 API Error Handler");

    if (error && typeof error === "object" && "message" in error) {
        const apiError = error as APIError;

        console.log("API Error:", {
            message: apiError.message,
            statusCode: apiError.status_code,
            error: apiError.error,
            details: apiError.details
        });

        console.groupEnd();
        return apiError.message || "An unexpected error occurred.";
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

export const useCategoryPosts = (category: BlogCategory): UseCategoryPostsReturn => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (): Promise<void> => {
        try {
            console.log(`🔍 Fetching posts for category: ${category}`);
            setLoading(true);
            setError(null);

            const fetchedPosts = await blogService.getPostsByCategory(category);
            console.log(`✅ Category posts fetched for ${category}:`, fetchedPosts.length);

            const validPosts = fetchedPosts.filter(post => {
                if (!post.categories) {
                    return false;
                }

                const postCategories = Array.isArray(post.categories)
                    ? post.categories
                    : [post.categories];

                return postCategories.includes(category);
            });
            console.log(`📋 Valid posts after category validation: ${validPosts.length}`);
            setPosts(validPosts);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
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