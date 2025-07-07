"use client";

import { useState, useEffect } from "react";
import { X, Save, Eye, Plus, Edit3 } from "lucide-react";
import { BlogPost, BlogPostFormData } from "@/services/blogService";

interface BlogPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post?: BlogPost | null;
    onSubmit: (data: BlogPostFormData) => Promise<void>;
    isLoading?: boolean;
}

interface BlogPostsManagerProps {
    posts: BlogPost[];
    onCreatePost: (data: BlogPostFormData) => Promise<void>;
    onUpdatePost: (id: string, data: BlogPostFormData) => Promise<void>;
    onDeletePost: (id: string) => Promise<void>;
    isLoading?: boolean;
}

const BlogPostModal: React.FC<BlogPostModalProps> = ({
    isOpen,
    onClose,
    post,
    onSubmit,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<BlogPostFormData>({
        title: "",
        content: "",
        excerpt: "",
        featured_image: "",
        is_published: false,
        is_featured: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form data when modal opens/closes or when editing different post
    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || "",
                content: post.content || "",
                excerpt: post.excerpt || "",
                featured_image: post.featured_image || "",
                is_published: post.is_published || false,
                is_featured: post.is_featured || false,
            });
        } else {
            setFormData({
                title: "",
                content: "",
                excerpt: "",
                featured_image: "",
                is_published: false,
                is_featured: false,
            });
        }
        setErrors({});
    }, [post, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.trim().length < 3) {
            newErrors.title = "Title must be at least 3 characters";
        } else if (formData.title.trim().length > 200) {
            newErrors.title = "Title must be less than 200 characters";
        }

        // Content validation
        if (!formData.content.trim()) {
            newErrors.content = "Content is required";
        } else if (formData.content.trim().length < 10) {
            newErrors.content = "Content must be at least 10 characters";
        }

        // Excerpt validation
        if (formData.excerpt && formData.excerpt.length > 500) {
            newErrors.excerpt = "Excerpt must be less than 500 characters";
        }

        // Featured image URL validation
        if (formData.featured_image && formData.featured_image.trim()) {
            try {
                new URL(formData.featured_image);
                if (!/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(formData.featured_image)) {
                    newErrors.featured_image = "Must be a valid image URL";
                }
            } catch {
                newErrors.featured_image = "Must be a valid URL";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent)   => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setErrors({});

            // Clean up form data before submission
            const cleanedData: BlogPostFormData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                excerpt: formData.excerpt?.trim() || undefined,
                featured_image: formData.featured_image?.trim() || undefined,
                is_published: formData.is_published,
                is_featured: formData.is_featured,
            };

            await onSubmit(cleanedData);
            onClose();
        } catch (error) {
            console.error("Error submitting blog post:", error);
            setErrors({ 
                submit: error instanceof Error ? error.message : "Failed to save blog post" 
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof BlogPostFormData, value: any)   => {
        setFormData(prev   => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev   => ({ ...prev, [field]: "" }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className = "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className = "flex items-center justify-between p-6 border-b">
                    <h2 className = "text-xl font-semibold text-gray-900">
                        {post ? "Edit Blog Post" : "Create New Blog Post"}
                    </h2>
                    <button
                        onClick = {onClose}
                        className = "text-gray-400 hover:text-gray-600 transition-colors"
                        disabled = {submitting}
                    >
                        <X className = "h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit = {handleSubmit} className = "flex flex-col h-full">
                    <div className = "flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor = "title" className = "block text-sm font-medium text-gray-700 mb-2">
                                Title <span className = "text-red-500">*</span>
                            </label>
                            <input
                                id = "title"
                                type = "text"
                                value = {formData.title}
                                onChange = {(e)   => handleInputChange("title", e.target.value)}
                                className = {`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.title ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder = "Enter blog post title..."
                                disabled = {submitting}
                            />
                            {errors.title && (
                                <p className = "mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label htmlFor = "excerpt" className = "block text-sm font-medium text-gray-700 mb-2">
                                Excerpt
                            </label>
                            <textarea
                                id = "excerpt"
                                value = {formData.excerpt || ""}
                                onChange = {(e)   => handleInputChange("excerpt", e.target.value)}
                                rows = {2}
                                className = {`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.excerpt ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder = "Brief summary of the post..."
                                disabled = {submitting}
                            />
                            {errors.excerpt && (
                                <p className = "mt-1 text-sm text-red-600">{errors.excerpt}</p>
                            )}
                        </div>

                        {/* Featured Image */}
                        <div>
                            <label htmlFor = "featured_image" className = "block text-sm font-medium text-gray-700 mb-2">
                                Featured Image URL
                            </label>
                            <input
                                id = "featured_image"
                                type = "url"
                                value = {formData.featured_image || ""}
                                onChange = {(e)   => handleInputChange("featured_image", e.target.value)}
                                className = {`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.featured_image ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder = "https://example.com/image.jpg"
                                disabled = {submitting}
                            />
                            {errors.featured_image && (
                                <p className = "mt-1 text-sm text-red-600">{errors.featured_image}</p>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label htmlFor = "content" className = "block text-sm font-medium text-gray-700 mb-2">
                                Content <span className = "text-red-500">*</span>
                            </label>
                            <textarea
                                id = "content"
                                value = {formData.content}
                                onChange = {(e)   => handleInputChange("content", e.target.value)}
                                rows = {12}
                                className = {`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.content ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder = "Write your blog post content here..."
                                disabled = {submitting}
                            />
                            {errors.content && (
                                <p className = "mt-1 text-sm text-red-600">{errors.content}</p>
                            )}
                        </div>

                        {/* Options */}
                        <div className = "grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className = "flex items-center">
                                <input
                                    id = "is_published"
                                    type = "checkbox"
                                    checked = {formData.is_published}
                                    onChange = {(e)   => handleInputChange("is_published", e.target.checked)}
                                    className = "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled = {submitting}
                                />
                                <label htmlFor = "is_published" className = "ml-2 block text-sm text-gray-700">
                                    Publish immediately
                                </label>
                            </div>

                            <div className = "flex items-center">
                                <input
                                    id = "is_featured"
                                    type = "checkbox"
                                    checked = {formData.is_featured}
                                    onChange = {(e)   => handleInputChange("is_featured", e.target.checked)}
                                    className = "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled = {submitting}
                                />
                                <label htmlFor = "is_featured" className = "ml-2 block text-sm text-gray-700">
                                    Mark as featured
                                </label>
                            </div>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className = "bg-red-50 border border-red-200 rounded-md p-3">
                                <p className = "text-sm text-red-700">{errors.submit}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className = "flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                        <button
                            type = "button"
                            onClick = {onClose}
                            className = "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled = {submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type = "submit"
                            disabled = {submitting || isLoading}
                            className = "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <div className = "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className = "h-4 w-4 mr-2" />
                                    {post ? "Update Post" : "Create Post"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const BlogPostsManager: React.FC<BlogPostsManagerProps> = ({
    posts,
    onCreatePost,
    onUpdatePost,
    onDeletePost,
    isLoading = false
})   => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleModalSubmit = async (data: BlogPostFormData)   => {
        if (editingPost) {
            await onUpdatePost(editingPost.id, data);
        } else {
            await onCreatePost(data);
        }
    };

    const handleEdit = (post: BlogPost)   => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleCreate = ()   => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string)   => {
        if (window.confirm("Are you sure you want to delete this blog post?")) {
            try {
                setDeletingId(id);
                await onDeletePost(id);
            } catch (error) {
                console.error("Error deleting post:", error);
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleCloseModal = ()   => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    const formatDate = (dateString: string)   => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className = "space-y-6">
            {/* Header */}
            <div className = "flex justify-between items-center">
                <h3 className = "text-lg font-semibold text-gray-900">Blog Posts</h3>
                <button
                    onClick = {handleCreate}
                    className = "inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className = "h-4 w-4 mr-2" />
                    New Post
                </button>
            </div>

            {/* Posts List */}
            {isLoading ? (
                <div className = "flex items-center justify-center py-12">
                    <div className = "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className = "text-center py-12">
                    <p className = "text-gray-500">No blog posts yet. Create your first post!</p>
                </div>
            ) : (
                <div className = "bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className = "divide-y divide-gray-200">
                        {posts.map((post) => (
                            <li key = {post.id}>
                                <div className = "px-4 py-4 flex items-center justify-between">
                                    <div className = "flex-1 min-w-0">
                                        <div className = "flex items-center space-x-3">
                                            <h3 className = "text-sm font-medium text-gray-900 truncate">
                                                {post.title}
                                            </h3>
                                            <div className = "flex items-center space-x-2">
                                                {post.is_published ? (
                                                    <span className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Draft
                                                    </span>
                                                )}
                                                {post.is_featured && (
                                                    <span className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className = "mt-1 flex items-center text-sm text-gray-500">
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
                                                className = "text-gray-400 hover:text-gray-600"
                                            >
                                                <Eye className = "h-4 w-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick = {()   => handleEdit(post)}
                                            className = "text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit3 className = "h-4 w-4" />
                                        </button>
                                        <button
                                            onClick = {()   => handleDelete(post.id)}
                                            disabled = {deletingId === post.id}
                                            className = "text-red-600 hover:text-red-800 disabled:opacity-50"
                                        >
                                            {deletingId === post.id ? (
                                                <div className = "animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                                            ) : (
                                                <X className = "h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Modal */}
            <BlogPostModal
                isOpen = {isModalOpen}
                onClose = {handleCloseModal}
                post = {editingPost}
                onSubmit = {handleModalSubmit}
                isLoading = {isLoading}
            />
        </div>
    );
};