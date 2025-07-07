// src/config/api.ts

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    // Blog endpoints
    BLOG: '/api/blog',
    BLOG_PUBLISHED: '/api/blog/published',
    BLOG_FEATURED: '/api/blog/featured',
    BLOG_BY_SLUG: (slug: string) => `/api/blog/slug/${slug}`,
    BLOG_BY_ID: (id: string) => `/api/blog/${id}`,
    
    // Admin endpoints
    ADMINISTRATORS: '/api/administrators',
    
    // Auth endpoints
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
  }
} as const;

export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};