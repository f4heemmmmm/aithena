// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FileText, Shield, LogOut, PenTool, Plus, TrendingUp } from 'lucide-react';
import { BlogPostsManager } from '@/components/BlogPostModal';
import { useBlogPosts, useBlogStatistics } from '@/hooks/useBlog';
import { BlogPostFormData } from '@/types/blog';

export default function AdminDashboard() {
  const { isAuthenticated, admin, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  // Blog hooks
  const { 
    posts, 
    loading: postsLoading, 
    error: postsError, 
    createPost, 
    updatePost, 
    deletePost,
    refetch: refetchPosts 
  } = useBlogPosts();

  const { 
    statistics: blogStats, 
    loading: statsLoading, 
    refetch: refetchStats 
  } = useBlogStatistics();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCreatePost = async (data: BlogPostFormData) => {
    try {
      await createPost(data);
      await refetchStats(); // Refresh statistics after creating
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  };

  const handleUpdatePost = async (id: string, data: BlogPostFormData) => {
    try {
      await updatePost(id, data);
      await refetchStats(); // Refresh statistics after updating
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      await refetchStats(); // Refresh statistics after deleting
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Blog Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{admin?.first_name} {admin?.last_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Blog Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Blog Posts */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {statsLoading ? '...' : blogStats?.total || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Published Posts */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PenTool className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                      <dd className="text-lg font-medium text-green-600">
                        {statsLoading ? '...' : blogStats?.published || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Draft Posts */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Drafts</dt>
                      <dd className="text-lg font-medium text-yellow-600">
                        {statsLoading ? '...' : blogStats?.drafts || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Posts */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Plus className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Featured</dt>
                      <dd className="text-lg font-medium text-purple-600">
                        {statsLoading ? '...' : blogStats?.featured || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          {blogStats && (
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Publishing Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {blogStats.total > 0 ? Math.round((blogStats.published / blogStats.total) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Publication Rate</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{blogStats.recentlyPublished}</div>
                    <div className="text-sm text-gray-600">Published This Week</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{blogStats.featured}</div>
                    <div className="text-sm text-gray-600">Featured Posts</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {postsError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Blog Posts</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{postsError}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={refetchPosts}
                      className="text-sm bg-red-100 text-red-800 rounded-md px-3 py-2 hover:bg-red-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Blog Posts Management */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Blog Posts Management</h3>
                <div className="text-sm text-gray-500">
                  Manage your blog content, create new posts, and update existing ones.
                </div>
              </div>
              
              <BlogPostsManager
                posts={posts}
                onCreatePost={handleCreatePost}
                onUpdatePost={handleUpdatePost}
                onDeletePost={handleDeletePost}
                isLoading={postsLoading}
              />
            </div>
          </div>

          {/* Admin Information */}
          <div className="bg-white shadow rounded-lg mt-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="text-sm text-gray-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="mb-2"><strong className="text-gray-700">Name:</strong> {admin?.first_name} {admin?.last_name}</p>
                    <p className="mb-2"><strong className="text-gray-700">Email:</strong> {admin?.email}</p>
                    <p><strong className="text-gray-700">Role:</strong> Administrator</p>
                  </div>
                  <div>
                    <p className="mb-2"><strong className="text-gray-700">System:</strong> <span className="text-green-600">Active</span></p>
                    <p className="mb-2"><strong className="text-gray-700">Access Level:</strong> Full Blog Management</p>
                    <p><strong className="text-gray-700">Last Login:</strong> Current Session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}