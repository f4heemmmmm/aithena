import { useState, useEffect, useCallback } from "react";

import { blogService } from "@/services/blogService";
import { BlogPost, BlogPostFormData, BlogPostQuery, BlogStatistics, ApiError } from "@/services/blogService";

export interface UseBlogPostsReturn {
    posts: BlogPost[];
    loading: boolean;
    error: string | null;
    count: number;
    totalPages: number;
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

const handleApiError = (error: unknown): string => {
    // Handle custom ApiError type from blogService
    if (error && typeof error === "object" && "message" in error) {
        const apiError = error as ApiError;
        return apiError.message || "An unexpected error occurred";
    }
    
    if (error instanceof Error) {
        return error.message;
    }
    
    if (typeof error === "string") {
        return error;
    }
    
    console.warn("Received unknown error type:", error);
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
            setLoading(true);
            setError(null);
            const result = await blogService.getAllPosts(query);
            setPosts(result.posts);
            setCount(result.count);
            setTotalPages(result.totalPages);
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error("Error fetching posts:", err);
            setPosts([]);
            setCount(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const createPost = useCallback(async (data: BlogPostFormData): Promise<BlogPost> => {
        try {
            setError(null);
            const newPost = await blogService.createPost(data);
            setPosts(prev => [newPost, ...prev]);
            setCount(prev => prev + 1);
            return newPost;
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const updatePost = useCallback(async (id: string, data: Partial<BlogPostFormData>): Promise<BlogPost> => {
        try {
            setError(null);
            const updatedPost = await blogService.updatePost(id, data);
            setPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
            return updatedPost;
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const deletePost = useCallback(async (id: string): Promise<void> => {
        try {
            setError(null);
            await blogService.deletePost(id);
            setPosts(prev => prev.filter(post => post.id !== id));
            setCount(prev => Math.max(0, prev - 1));
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const refetch = useCallback(async (): Promise<void> => {
        await fetchPosts(initialQuery);
    }, [fetchPosts, initialQuery]);

    useEffect(() => {
        fetchPosts(initialQuery);
    }, [fetchPosts, initialQuery]);

    return {
        posts,
        loading,
        error,
        count,
        totalPages,
        refetch,
        createPost,
        updatePost,
        deletePost,
    };
};

export const useBlogPost = (id?: string): UseBlogPostReturn => {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(!!id);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = useCallback(async (postId: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            const fetchedPost = await blogService.getPostById(postId);
            setPost(fetchedPost);
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error("Error fetching post:", err);
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
            setError(null);
            const updatedPost = await blogService.updatePost(post.id, data);
            setPost(updatedPost);
            return updatedPost;
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [post]);

    const deletePost = useCallback(async (): Promise<void> => {
        if (!post) {
            throw new Error("No post to delete");
        }
        try {
            setError(null);
            await blogService.deletePost(post.id);
            setPost(null);
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [post]);

    const refetch = useCallback(async (): Promise<void> => {
        if (id) {
            await fetchPost(id);
        }
    }, [fetchPost, id]);

    useEffect(() => {
        if (id) {
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
            setLoading(true);
            setError(null);
            setNotFound(false);

            const fetchedPost = await blogService.getPostBySlug(postSlug);
            if (fetchedPost) {
                setPost(fetchedPost);
            } else {
                setNotFound(true);
                setPost(null);
            }
        } catch (err: unknown) {
            const apiError = err as ApiError;
            if (apiError.statusCode === 404) {
                setNotFound(true);
                setPost(null);
            } else {
                const errorMessage = handleApiError(err);
                setError(errorMessage);
                setPost(null);
            }
            console.error("Error fetching post by slug:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (): Promise<void> => {
        if (slug) {
            await fetchPost(slug);
        }
    }, [fetchPost, slug]);

    useEffect(() => {
        if (slug && slug.trim()) {
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
            setLoading(true);
            setError(null);
            const fetchedPosts = await blogService.getPublishedPosts();
            setPosts(fetchedPosts);
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error("Error fetching published posts:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (): Promise<void> => {
        await fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
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
            setLoading(true);
            setError(null);
            const fetchedPosts = await blogService.getFeaturedPosts(limit);
            setPosts(fetchedPosts);
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error("Error fetching featured posts:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    const refetch = useCallback(async (): Promise<void> => {
        await fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
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
            setLoading(true);
            setError(null);
            const fetchedPosts = await blogService.getRecentPosts(limit);
            setPosts(fetchedPosts);
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error("Error fetching recent posts:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [limit]);

    const refetch = useCallback(async (): Promise<void> => {
        await fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
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
            setLoading(true);
            setError(null);
            const stats = await blogService.getStatistics();
            setStatistics(stats);
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error("Error fetching statistics:", err);
            setStatistics(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async (): Promise<void> => {
        await fetchStatistics();
    }, [fetchStatistics]);

    useEffect(() => {
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
            setPosts([]);
            setError(null);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const results = await blogService.searchPosts(searchTerm.trim(), onlyPublished);
            setPosts(results);
        } catch (err: unknown) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            console.error("Error searching posts:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSearch = useCallback((): void => {
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