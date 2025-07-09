"use client";

import { X, Save, Edit3, Tag } from "lucide-react";
import React, { useState, useEffect } from "react";

import ImageUpload from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { BlogPost, BlogPostFormData, UploadedImageData, BlogCategory } from "@/services/blogService";

interface BlogPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post?: BlogPost | null;
    onSubmit: (data: BlogPostFormData) => Promise<void>;
    isLoading?: boolean;
}

interface CategoryOption {
    value: BlogCategory;
    label: string;
    description: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
    {
        value: BlogCategory.NEWSROOM,
        label: "Newsroom",
        description: "Latest news and updates from our company"
    },
    {
        value: BlogCategory.THOUGHT_PIECES,
        label: "Thought Pieces",
        description: "In-depth analysis and thought leadership articles"
    },
    {
        value: BlogCategory.ACHIEVEMENTS,
        label: "Achievements",
        description: "Milestones, successes, and company achievements"
    },
    {
        value: BlogCategory.AWARDS_RECOGNITION,
        label: "Awards & Recognition",
        description: "Awards, recognitions, and industry accolades"
    }
];

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
        uploaded_image: "",
        uploaded_image_filename: "",
        uploaded_image_content_type: "",
        is_published: false,
        is_featured: false,
        categories: [BlogCategory.NEWSROOM],
    });

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || "",
                content: post.content || "",
                excerpt: post.excerpt || "",
                featured_image: post.featured_image || "",
                uploaded_image: post.uploaded_image || "",
                uploaded_image_filename: post.uploaded_image_filename || "",
                uploaded_image_content_type: post.uploaded_image_content_type || "",
                is_published: post.is_published || false,
                is_featured: post.is_featured || false,
                categories: post.categories && post.categories.length > 0 
                    ? post.categories 
                    : [BlogCategory.NEWSROOM],
            });
        } else {
            setFormData({
                title: "",
                content: "",
                excerpt: "",
                featured_image: "",
                uploaded_image: "",
                uploaded_image_filename: "",
                uploaded_image_content_type: "",
                is_published: false,
                is_featured: false,
                categories: [BlogCategory.NEWSROOM],
            });
        }
        setErrors({});
    }, [post, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length > 200) {
            newErrors.title = "Title must be less than 200 characters";
        }

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = formData.content;
        const textContent = tempDiv.textContent || "";

        if (!textContent.trim()) {
            newErrors.content = "Content is required";
        } else if (textContent.length < 10) {
            newErrors.content = "Content must be at least 10 characters";
        }

        if (formData.excerpt && formData.excerpt.length > 500) {
            newErrors.excerpt = "Excerpt must be less than 500 characters";
        }

        if (formData.featured_image?.trim()) {
            try {
                new URL(formData.featured_image);
                if (!/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(formData.featured_image)) {
                    newErrors.featured_image = "Must be a valid image URL";
                }
            } catch {
                newErrors.featured_image = "Must be a valid URL";
            }
        }

        // Validate uploaded image data integrity
        if (formData.uploaded_image) {
            if (!formData.uploaded_image_filename) {
                newErrors.uploaded_image = "Image filename is missing";
            }
            if (!formData.uploaded_image_content_type) {
                newErrors.uploaded_image = "Image content type is missing";
            }
            if (!formData.uploaded_image.startsWith('data:image/')) {
                newErrors.uploaded_image = "Invalid image data format";
            }
        }

        // Validate categories
        if (!formData.categories || formData.categories.length === 0) {
            newErrors.categories = "At least one category must be selected";
        } else if (formData.categories.length > 4) {
            newErrors.categories = "Maximum 4 categories can be selected";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {   
            setSubmitting(true);
            setErrors({});
            
            // Prepare form data, removing empty image fields
            const submitData: BlogPostFormData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                excerpt: formData.excerpt?.trim() || undefined,
                featured_image: formData.featured_image?.trim() || undefined,
                uploaded_image: formData.uploaded_image?.trim() || undefined,
                uploaded_image_filename: formData.uploaded_image_filename?.trim() || undefined,
                uploaded_image_content_type: formData.uploaded_image_content_type?.trim() || undefined,
                is_published: formData.is_published,
                is_featured: formData.is_featured,
                categories: formData.categories && formData.categories.length > 0 
                    ? formData.categories 
                    : [BlogCategory.NEWSROOM],
            };

            // Remove undefined image fields to avoid sending empty data
            if (!submitData.uploaded_image) {
                delete submitData.uploaded_image;
                delete submitData.uploaded_image_filename;
                delete submitData.uploaded_image_content_type;
            }

            if (!submitData.featured_image) {
                delete submitData.featured_image;
            }

            if (!submitData.excerpt) {
                delete submitData.excerpt;
            }

            await onSubmit(submitData);
            onClose();
        } catch (error) {
            setErrors({
                submit: error instanceof Error ? error.message : "Failed to save blog post"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (
        field: keyof BlogPostFormData, 
        value: string | boolean | BlogCategory[]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleImageUpload = (imageData: UploadedImageData | null) => {
        if (imageData) {
            setFormData(prev => ({
                ...prev,
                uploaded_image: imageData.base64,
                uploaded_image_filename: imageData.filename,
                uploaded_image_content_type: imageData.contentType,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                uploaded_image: "",
                uploaded_image_filename: "",
                uploaded_image_content_type: "",
            }));
        }
        
        // Clear any image upload errors
        if (errors.uploaded_image) {
            setErrors(prev => ({ ...prev, uploaded_image: "" }));
        }
    };

    const handleCategoryChange = (category: BlogCategory, checked: boolean) => {
        const currentCategories = formData.categories || [];
        
        if (checked) {
            // Add category if not already present
            if (!currentCategories.includes(category)) {
                const newCategories = [...currentCategories, category];
                updateField("categories", newCategories);
            }
        } else {
            // Remove category, but ensure at least one remains
            const newCategories = currentCategories.filter(c => c !== category);
            if (newCategories.length > 0) {
                updateField("categories", newCategories);
            }
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100/60 rounded-lg">
                            <Edit3 className="h-5 w-5 text-blue-800" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {post ? "Edit Blog Post" : "Create New Blog Post"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        disabled={submitting}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 ${
                                    errors.title ? "border-red-300" : "border-gray-200"
                                }`}
                                placeholder="Enter your blog post title..."
                                disabled={submitting}
                            />
                            {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        {/* Categories Section */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-3">
                                <Tag className="h-5 w-5 inline mr-2" />
                                Categories <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {CATEGORY_OPTIONS.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex items-start p-4 bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:border-blue-300 ${
                                            formData.categories.includes(option.value)
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.categories.includes(option.value)}
                                            onChange={(e) => handleCategoryChange(option.value, e.target.checked)}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                                            disabled={submitting}
                                        />
                                        <div className="ml-3">
                                            <span className="font-medium text-sm text-gray-700">
                                                {option.label}
                                            </span>
                                            <span className="block text-gray-500 text-xs leading-relaxed">
                                                {option.description}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.categories && <p className="mt-2 text-sm text-red-600">{errors.categories}</p>}
                            <p className="mt-2 text-sm text-gray-500">
                                Select one or more categories where this post will appear. Your post will be visible on all selected category pages.
                            </p>
                        </div>

                        {/* Main Image Upload Section */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-3">
                                Main Image
                            </label>
                            <ImageUpload
                                value={formData.uploaded_image}
                                filename={formData.uploaded_image_filename}
                                contentType={formData.uploaded_image_content_type}
                                onChange={handleImageUpload}
                                disabled={submitting}
                                error={errors.uploaded_image}
                                maxSizeBytes={1024 * 1024} // 1MB final size
                                maxOriginalSizeBytes={10 * 1024 * 1024} // 10MB original size
                                acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                compressionOptions={{
                                    maxWidth: 1200,
                                    maxHeight: 800,
                                    quality: 0.8,
                                    maxSizeBytes: 1024 * 1024
                                }}
                            />
                            {errors.uploaded_image && <p className="mt-2 text-sm text-red-600">{errors.uploaded_image}</p>}
                            <p className="mt-2 text-sm text-gray-500">
                                This image will be displayed prominently at the top of your blog post, right after the title.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">Excerpt</label>
                                <textarea
                                    value={formData.excerpt || ""}
                                    onChange={(e) => updateField("excerpt", e.target.value)}
                                    rows={3}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-600 ${
                                        errors.excerpt ? "border-red-300" : "border-gray-200"
                                    }`}
                                    placeholder="Brief summary..."
                                    disabled={submitting}
                                />
                                {errors.excerpt && <p className="mt-2 text-sm text-red-600">{errors.excerpt}</p>}
                            </div>
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-2">Featured Image URL</label>
                                <input
                                    type="url"
                                    value={formData.featured_image || ""}
                                    onChange={(e) => updateField("featured_image", e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 ${
                                        errors.featured_image ? "border-red-300" : "border-gray-200"
                                    }`}
                                    placeholder="https://example.com/image.jpg"
                                    disabled={submitting}
                                />
                                {errors.featured_image && <p className="mt-2 text-sm text-red-600">{errors.featured_image}</p>}
                                <p className="mt-1 text-xs text-gray-500">
                                    Optional: External image URL for social media previews
                                </p>
                            </div>
                        </div>
                        
                        {/* RICH TEXT EDITOR */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-3">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(value) => updateField("content", value)}
                                disabled={submitting}
                                error={errors.content}
                                placeholder="Start writing your post..."
                            />
                            {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content}</p>}
                        </div>

                        {/* PUBLISHING OPTIONS */}
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="flex items-center p-3 bg-white rounded-lg border cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_published}
                                        onChange={(e) => updateField("is_published", e.target.checked)}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={submitting}
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-sm text-gray-700">Publish immediately</span>
                                        <span className="block text-gray-500 text-xs">Make visible to readers</span>
                                    </div>
                                </label>

                                <label className="flex items-center p-3 bg-white rounded-lg border cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => updateField("is_featured", e.target.checked)}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        disabled={submitting}
                                    />
                                    <div className="ml-3">
                                        <span className="font-medium text-sm text-gray-700">Mark as featured</span>
                                        <span className="block text-gray-500 text-xs">Highlight on blog</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        {errors.submit && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                                <p className="text-sm text-red-700">{errors.submit}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                        <div className="text-sm text-gray-500">
                            {post ? `Last updated: ${new Date(post.updated_at).toLocaleDateString()}` : "New post"}
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || isLoading}
                                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {post ? "Update Post" : "Create Post"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogPostModal;