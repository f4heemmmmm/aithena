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

export const useBlogPost = (id?: string): UseBlogPostReturn => {
    const [loading, setLoading] = useState(!!id);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = useCallback(async (postId: string): Promise<void> => {
        try {
            console.log("🔍 Fetching post by ID:", postId);
            setLoading(true);
            setError(null);
            
            const fetchedPost = await blogService.getPostByID(postId);
            console.log("✅ Post fetched successfully:", fetchedPost.title);
            setPost(fetchedPost);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error fetching post:", err);
            setError(errorMessage);
            setPost(null);
        } finally {
            setLoading(false);
        }
    }, []); 

    const updatePost = useCallback(async (data: Partial<BlogPostFormData>): Promise<BlogPost> => {
        if (!post) {
            throw new Error("No post to update");
        }
        try {
            console.log("📝 Updating current post:", post.id);
            setError(null);
            
            const updatedPost = await blogService.updatePost(post.id, data);
            console.log("✅ Current post updated successfully");
            setPost(updatedPost);
            return updatedPost;
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error updating current post:", err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [post]);

    const deletePost = useCallback(async (): Promise<void> => {
        if (!post) {
            throw new Error("No post to delete");
        }
        try {
            console.log("🗑️ Deleting current post:", post.id);
            setError(null);
            
            await blogService.deletePost(post.id);
            console.log("✅ Current post deleted successfully");
            setPost(null);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error deleting current post:", err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [post]);

    const refetch = useCallback(async (): Promise<void> => {
        if (id) {
            console.log("🔄 Refetching post by ID:", id);
            await fetchPost(id);
        }
    }, [fetchPost, id]);

    useEffect(() => {
        if (id) {
            console.log("🎯 useBlogPost hook initialized for ID:", id);
            fetchPost(id);
        } else {
            setPost(null);
            setLoading(false);
            setError(null);
        }
    }, [fetchPost, id]);

    return {
        post,
        loading,
        error,
        refetch,
        updatePost,
        deletePost,
    };
};

export const useBlogPostBySlug = (slug?: string): UseBlogPostBySlugReturn => {
    const [loading, setLoading] = useState(!!slug);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [post, setPost] = useState<BlogPost | null>(null);

    const fetchPost = useCallback(async (postSlug: string): Promise<void> => {
        try {
            console.log("🔍 Fetching post by slug:", postSlug);
            setLoading(true);
            setError(null);
            setNotFound(false);

            const fetchedPost = await blogService.getPostBySlug(postSlug);
            if (fetchedPost) {
                console.log("✅ Post found by slug:", fetchedPost.title);
                setPost(fetchedPost);
                
                if (fetchedPost.is_published) {
                    try {
                        await blogService.incrementViewCount(postSlug);
                        console.log("👁️ View count incremented for:", postSlug);
                    } catch (viewError) {
                        console.warn("⚠️ Failed to increment view count:", viewError);
                    }
                }
            } else {
                console.log("❌ Post not found with slug:", postSlug);
                setNotFound(true);
                setPost(null);
            }
        } catch (err: unknown) {
            const apiError = err as APIError;
            if (apiError.status_code === 404) {
                console.log("❌ Post not found (404):", postSlug);
                setNotFound(true);
                setPost(null);
            } else {
                const errorMessage = handleAPIError(err);
                console.error("❌ Error fetching post by slug:", err);
                setError(errorMessage);
                setPost(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (): Promise<void> => {
        if (slug) {
            console.log("🔄 Refetching post by slug:", slug);
            await fetchPost(slug);
        }
    }, [fetchPost, slug]);

    useEffect(() => {
        if (slug && slug.trim()) {
            console.log("🎯 useBlogPostBySlug hook initialized for:", slug);
            fetchPost(slug.trim());
        } else {
            setPost(null);
            setLoading(false);
            setError(null);
            setNotFound(false);
        }
    }, [fetchPost, slug]);

    return {
        post,
        loading,
        error,
        notFound,
        refetch,
    };
};

export const usePublishedPosts = (): UsePublishedPostsReturn => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (): Promise<void> => {
        try {
            console.log("🔍 Fetching published posts...");
            setLoading(true);
            setError(null);
            
            const fetchedPosts = await blogService.getPublishedPosts();
            console.log("✅ Published posts fetched:", fetchedPosts.length);
            setPosts(fetchedPosts);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error fetching published posts:", err);
            setError(errorMessage);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (): Promise<void> => {
        console.log("🔄 Refetching published posts...");
        await fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        console.log("🎯 usePublishedPosts hook initialized");
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        loading,
        error,
        refetch,
    };
};

export const useFeaturedPosts = (limit?: number): UseFeaturedPostsReturn => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (): Promise<void> => {
        try {
            console.log("🔍 Fetching featured posts...", limit ? `(limit: ${limit})` : "");
            setLoading(true);
            setError(null);
            
            const fetchedPosts = await blogService.getFeaturedPosts(limit);
            console.log("✅ Featured posts fetched:", fetchedPosts.length);
            setPosts(fetchedPosts);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error fetching featured posts:", err);
            setError(errorMessage);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    const refetch = useCallback(async (): Promise<void> => {
        console.log("🔄 Refetching featured posts...");
        await fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        console.log("🎯 useFeaturedPosts hook initialized");
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        loading,
        error,
        refetch,
    };
};

export const useRecentPosts = (limit?: number): UseRecentPostsReturn => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async (): Promise<void> => {
        try {
            console.log("🔍 Fetching recent posts...", limit ? `(limit: ${limit})` : "");
            setLoading(true);
            setError(null);
            
            const fetchedPosts = await blogService.getRecentPosts(limit);
            console.log("✅ Recent posts fetched:", fetchedPosts.length);
            setPosts(fetchedPosts);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error fetching recent posts:", err);
            setError(errorMessage);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    const refetch = useCallback(async (): Promise<void> => {
        console.log("🔄 Refetching recent posts...");
        await fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        console.log("🎯 useRecentPosts hook initialized");
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        loading,
        error,
        refetch,
    };
};

export const useBlogStatistics = (): UseBlogStatisticsReturn => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<BlogStatistics | null>(null);

    const fetchStatistics = useCallback(async (): Promise<void> => {
        try {
            console.log("📊 Fetching blog statistics...");
            setLoading(true);
            setError(null);
            
            const stats = await blogService.getStatistics();
            console.log("✅ Statistics fetched:", {
                total: stats.total,
                published: stats.published,
                drafts: stats.drafts,
                featured: stats.featured
            });
            setStatistics(stats);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error fetching statistics:", err);
            setError(errorMessage);
            setStatistics(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (): Promise<void> => {
        console.log("🔄 Refetching statistics...");
        await fetchStatistics();
    }, [fetchStatistics]);

    useEffect(() => {
        console.log("🎯 useBlogStatistics hook initialized");
        fetchStatistics();
    }, [fetchStatistics]);

    return {
        statistics,
        loading,
        error,
        refetch,
    };
};

export const useBlogSearch = (): UseBlogSearchReturn => {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);

    const searchPosts = useCallback(async (searchTerm: string, onlyPublished: boolean = true): Promise<void> => {
        if (!searchTerm.trim()) {
            console.log("🔍 Empty search term, clearing results");
            setPosts([]);
            setError(null);
            return;
        }
        
        try {
            console.log(`🔍 Searching posts: "${searchTerm}" (published only: ${onlyPublished})`);
            setLoading(true);
            setError(null);
            
            const results = await blogService.searchPosts(searchTerm.trim(), onlyPublished);
            console.log(`✅ Search completed: ${results.length} results found`);
            setPosts(results);
        } catch (err: unknown) {
            const errorMessage = handleAPIError(err);
            console.error("❌ Error searching posts:", err);
            setError(errorMessage);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSearch = useCallback((): void => {
        console.log("🧹 Clearing search results");
        setPosts([]);
        setError(null);
        setLoading(false);
    }, []);

    return {
        posts,
        loading,
        error,
        searchPosts,
        clearSearch,
    };
};

export const useCategoryPosts = (category: BlogCategory) => {
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
            setPosts(fetchedPosts);
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

export default {
    useBlogPosts,
    useBlogPost,
    useBlogPostBySlug,
    usePublishedPosts,
    useFeaturedPosts,
    useRecentPosts,
    useBlogStatistics,
    useBlogSearch,
    useCategoryPosts,
};