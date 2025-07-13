"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inter, DM_Sans } from "next/font/google";
import { Plus, Edit3, Eye, X } from "lucide-react";

import { BlogPost } from "@/services/blogService";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

interface BlogPostsManagerProps {
    posts: BlogPost[];
    onDeletePost: (id: string) => Promise<void>;
    isLoading?: boolean;
}

export const BlogPostsManager: React.FC<BlogPostsManagerProps> = ({ posts, onDeletePost, isLoading = false }) => {
    const router = useRouter();
    const [deletingID, setDeletingID] = useState<string | null>(null);

    const handleEdit = (post: BlogPost): void => {
        router.push(`/blog/edit/${post.id}`);
    };

    const handleCreate = (): void => {
        router.push("/blog/create");
    };

    const handleDelete = async (id: string): Promise<void> => {
        if (window.confirm("Are you sure you want to delete this blog post?")) {
            try {
                setDeletingID(id);
                await onDeletePost(id);
            } catch (error) {
                console.error("Error deleting post");
            } finally {
                setDeletingID(null);
            }
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className = "space-y-8">
            <div className = "flex justify-between items-center">
                <div>
                    <h3 className = {`${dmSans.className} text-3xl font-light text-slate-900 mb-2`}>
                        Blog Posts
                    </h3>
                </div>
                <button
                    onClick = {handleCreate}
                    className = {`${inter.className} hover:cursor-pointer inline-flex items-center px-6 py-3 bg-slate-700 hover:scale-105 text-white text-md font-medium rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                    <Plus className = "h-4 w-4 mr-2" />
                    New Post
                </button>
            </div>

            {isLoading ? (
                <div className = "flex items-center justify-center py-20">
                    <div className = "animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
                </div>
            ) : posts.length === 0 ? (
                <div className = "text-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                    <div className = "p-8">
                        <Edit3 className = "h-16 w-16 text-slate-400 mx-auto mb-6" />
                        <h4 className = {`${dmSans.className} text-slate-600 text-xl font-light mb-2`}>
                            No blog posts yet
                        </h4>
                        <p className = {`${inter.className} text-slate-500`}>
                            Create your first post to get started!
                        </p>
                    </div>
                </div>
            ) : (
                <div className = "bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className = "divide-y divide-slate-100">
                        {posts.map((post) => (
                            <div key = {post.id} className = "px-8 py-6 hover:bg-slate-50 transition-colors">
                                <div className = "flex items-center justify-between">
                                    <div className = "flex-1 min-w-0">
                                        <div className = "flex items-center space-x-3 mb-3">
                                            <h3 className = {`${dmSans.className} text-lg font-light text-slate-900 truncate`}>
                                                {post.title}
                                            </h3>
                                            <div className = "flex items-center space-x-2">
                                                {post.is_published ? (
                                                    <span className = {`${inter.className} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700`}>
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className = {`${inter.className} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700`}>
                                                        Draft
                                                    </span>
                                                )}
                                                {post.is_featured && (
                                                    <span className = {`${inter.className} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className = {`${inter.className} flex items-center text-sm text-slate-500`}>
                                            <span>By {post.author.first_name} {post.author.last_name}</span>
                                            <span className = "mx-2">•</span>
                                            <span>{formatDate(post.updated_at)}</span>
                                        </div>
                                    </div>
                                    <div className = "flex items-center space-x-2">
                                        {post.is_published && (
                                            <a
                                                href = {`/blog/${post.slug}`}
                                                target = "_blank"
                                                rel = "noopener noreferrer"
                                                className = "p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title = "View Post"
                                            >
                                                <Eye className = "h-5 w-5" />
                                            </a>
                                        )}
                                        <button
                                            onClick = {() => handleEdit(post)}
                                            className = "p-3 text-slate-400 hover:text-slate-900 hover:cursor-pointer hover:bg-slate-100 rounded-full transition-colors"
                                            title = "Edit Post"
                                        >
                                            <Edit3 className = "h-5 w-5" />
                                        </button>
                                        <button
                                            onClick = {() => handleDelete(post.id)}
                                            disabled = {deletingID === post.id}
                                            className = "p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:cursor-pointer rounded-full transition-colors disabled:opacity-50"
                                            title = "Delete Post"
                                        >
                                            {deletingID === post.id ? (
                                                <div className = "animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                                            ) : (
                                                <X className = "h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};