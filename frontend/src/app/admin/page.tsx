"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Inter, DM_Sans } from "next/font/google";
import { FileText, PenTool, Plus, TrendingUp } from "lucide-react";

import { BlogPostsManager } from "@/components/BlogPostsManager";
import { useBlogPosts, useBlogStatistics } from "@/hooks/useBlog";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

export default function AdministratorDashboard() {
    const router = useRouter();
    const { isAuthenticated, administrator, logout, loading: authLoading } = useAuth();
    const { statistics: blogStats, loading: statsLoading, refetch: refetchStats } = useBlogStatistics();
    const { posts, loading: postsLoading, error: postsError, deletePost, refetch: refetchPosts } = useBlogPosts();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    const handleDeletePost = async (id: string) => {
        try {
            await deletePost(id);
            await refetchStats();
        } catch (error) {
            console.error("Error deleting blog post:", error);
            throw error;
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (authLoading) {
        return (
            <div className = "min-h-screen bg-slate-50 flex items-center justify-center">
                <div className = "animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className = "min-h-screen bg-slate-50">
            <header className = "bg-white border-b border-slate-200 py-6">
                <div className = "px-6 lg:px-12">
                    <div className = "flex justify-between items-center py-6">
                        <div>
                            <h1 className = {`${dmSans.className} text-6xl font-light text-slate-900`}>
                                Administrator Dashboard
                            </h1>   
                            <p className = {`${inter.className} text-right text-lg text-slate-600 mt-3`}>
                                Welcome Back, {administrator?.first_name}
                            </p>                     
                        </div>
                    </div>
                </div>
            </header>

             <main className = "py-12 px-6 lg:px-12">
                <div className = "grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-none">
                    <div className = "lg:col-span-1 space-y-6">
                        <div className = "bg-white rounded-xl border border-slate-200 p-6">
                            <div className = "space-y-4 flex flex-col gap-4">
                                <div className = "flex items-center">
                                    <div className = "flex-shrink-0">
                                        <FileText className = "h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className = "ml-3">
                                        <div className = {`${inter.className} text-sm font-semibold text-slate-500`}> Total Posts </div>
                                        <div className = {`${dmSans.className} text-xl font-light text-slate-900`}>
                                            {statsLoading ? '...' : blogStats?.total || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className = "flex items-center">
                                    <div className = "flex-shrink-0">
                                        <PenTool className = "h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className = "ml-3">
                                        <div className = {`${inter.className} text-sm font-semibold text-slate-500`}> Published </div>
                                        <div className = {`${dmSans.className} text-xl font-light text-slate-900`}>
                                            {statsLoading ? '...' : blogStats?.published || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className = "flex items-center">
                                    <div className = "flex-shrink-0">
                                        <TrendingUp className = "h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className = "ml-3">
                                        <div className = {`${inter.className} text-sm font-semibold text-slate-500`}> Drafts </div>
                                        <div className = {`${dmSans.className} text-xl font-light text-slate-900`}>
                                            {statsLoading ? '...' : blogStats?.drafts || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className = "flex items-center">
                                    <div className = "flex-shrink-0">
                                        <Plus className = "h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className = "ml-3">
                                        <div className = {`${inter.className} text-sm font-semibold text-slate-500`}> Featured </div>
                                        <div className = {`${dmSans.className} text-xl font-light text-slate-900`}>
                                            {statsLoading ? '...' : blogStats?.featured || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {blogStats && (
                            <div className = "bg-white rounded-xl border border-slate-200 p-6">
                                <h3 className = {`${dmSans.className} text-lg font-light text-slate-900 mb-4`}>
                                    Publishing Overview
                                </h3>
                                <div className = "space-y-4">
                                    <div className = "text-center p-4 bg-blue-50 rounded-lg">
                                        <div className = {`${dmSans.className} text-2xl font-light text-blue-600 mb-1`}>
                                            {blogStats.total > 0 ? Math.round((blogStats.published / blogStats.total) * 100) : 0}%
                                        </div>
                                        <div className = {`${inter.className} text-xs text-slate-600`}> Publication Rate </div>
                                    </div>
                                    <div className = "text-center p-4 bg-green-50 rounded-lg">
                                        <div className = {`${dmSans.className} text-2xl font-light text-green-600 mb-1`}>
                                            {blogStats.recently_published}
                                        </div>
                                        <div className = {`${inter.className} text-xs text-slate-600`}> Published This Week </div>
                                    </div>
                                        <div className = "text-center p-4 bg-purple-50 rounded-lg">
                                        <div className = {`${dmSans.className} text-2xl font-light text-purple-600 mb-1`}>
                                            {blogStats.featured}
                                        </div>
                                        <div className = {`${inter.className} text-xs text-slate-600`}> Featured Posts </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className = "lg:col-span-4">
                        {postsError && (
                            <div className = "bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                                <div className = "flex">
                                    <div className = "ml-3">
                                        <h3 className = {`${dmSans.className} text-lg font-medium text-red-800 mb-2`}>
                                            Error Loading Blog Posts
                                        </h3>
                                        <div className = {`${inter.className} text-sm text-red-700 mb-4`}>
                                            <p> {postsError} </p>
                                        </div>
                                        <button
                                            onClick = {refetchPosts}
                                            className = {`${inter.className} text-sm bg-red-100 text-red-800 rounded-lg px-4 py-2 hover:bg-red-200 transition-colors`}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className = "bg-white rounded-xl border border-slate-200 p-8">
                            <BlogPostsManager
                                posts = {posts}
                                onDeletePost = {handleDeletePost}
                                isLoading = {postsLoading}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}