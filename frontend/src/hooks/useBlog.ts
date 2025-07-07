// src/hooks/useBlog.ts
import { useState, useEffect, useCallback } from 'react';
import { blogService } from '@/services/blogService';
import { 
  BlogPost, 
  BlogPostFormData, 
  BlogPostQuery, 
  BlogStatistics,
  ApiError
} from '@/types/blog';

// Define hook return types
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

// Improved error handler with proper typing
const handleApiError = (error: unknown): string => {
  // Handle our custom ApiError type
  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError;
    return apiError.message || 'An unexpected error occurred';
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback for unknown error types
  console.warn('Received unknown error type:', error);
  return 'An unexpected error occurred';
};

// Hook for managing multiple blog posts
export const useBlogPosts = (initialQuery?: BlogPostQuery): UseBlogPostsReturn => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (query?: BlogPostQuery): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await blogService.getAllPosts(query);
      setPosts(result.posts);
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error fetching posts:', err);
      setPosts([]); // Clear posts on error
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (data: BlogPostFormData): Promise<BlogPost> => {
    try {
      setError(null);
      const newPost = await blogService.createPost(data);
      setPosts(prev => [newPost, ...prev]);
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
    refetch,
    createPost,
    updatePost,
    deletePost,
  };
};

// Hook for managing a single blog post
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
      console.error('Error fetching post:', err);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (data: Partial<BlogPostFormData>): Promise<BlogPost> => {
    if (!post) {
      throw new Error('No post to update');
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
      throw new Error('No post to delete');
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

// Hook for blog post by slug (public)
export const useBlogPostBySlug = (slug?: string): UseBlogPostBySlugReturn => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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
      console.error('Error fetching post by slug:', err);
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

// Hook for published posts (public)
export const usePublishedPosts = (): UsePublishedPostsReturn => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.error('Error fetching published posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
};

// Hook for featured posts (public)
export const useFeaturedPosts = (limit?: number): UseFeaturedPostsReturn => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.error('Error fetching featured posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
};

// Hook for recent posts (public)
export const useRecentPosts = (limit?: number): UseRecentPostsReturn => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.error('Error fetching recent posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
};

// Hook for blog statistics (admin)
export const useBlogStatistics = (): UseBlogStatisticsReturn => {
  const [statistics, setStatistics] = useState<BlogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const stats = await blogService.getStatistics();
      setStatistics(stats);
    } catch (err: unknown) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
};

// Hook for search functionality
export const useBlogSearch = (): UseBlogSearchReturn => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
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
      console.error('Error searching posts:', err);
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