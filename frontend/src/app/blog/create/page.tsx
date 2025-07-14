"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Inter, DM_Sans } from "next/font/google";
import { ArrowLeft, Save, Edit3, Tag, Plus } from "lucide-react";

import { useBlogPosts } from "@/hooks/useBlog";
import ImageUpload from "@/components/ImageUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { BlogPostFormData, BlogCategory, UploadedImageData } from "@/services/blogService";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

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

export default function CreateBlogPostPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { createPost, loading: createLoading } = useBlogPosts();
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length > 200) {
            newErrors.title = "Title must be less than 200 characters";
        }

        // Content validation
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = formData.content;
        const textContent = tempDiv.textContent || "";
        if (!textContent.trim()) {
            newErrors.content 
        } else if (textContent.length < 10) {
            newErrors.content = "Content must be at least 10 characters"
        }

        // Excerpt validation
        if (formData.excerpt && formData.excerpt.length > 500) {
            newErrors.excerpt = "Excerpt must be less than 500 characters"
        }

        // Featured image URL validation
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

        // Uploaded image validation
        if (formData.uploaded_image) {
            if (!formData.uploaded_image_filename) {
                newErrors.uploaded_image = "Image filename is missing";
            }
            if (!formData.uploaded_image_content_type) {
                newErrors.uploaded_image = "Image content type is missing";
            }
            if (!formData.uploaded_image.startsWith("data:image/")) {
                newErrors.uploaded_image = "Invalid image data format";
            }
        }

        // Categories validation
        const currentCategories = Array.isArray(formData.categories) ? formData.categories : [];
        if (currentCategories.length === 0) {
            newErrors.categories = "At least one category must be selected";
        } else if (currentCategories.length > 4) {
            newErrors.categories = "Maximum 4 categories can be selected";
        }

        // Validate each category
        const validCategories = Object.values(BlogCategory);
        const hasInvalidCategory = currentCategories.some(cat => !validCategories.includes(cat));
        if (hasInvalidCategory) {
            newErrors.categories = "One or more selected categories are invalid";
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
            const currentCategories = Array.isArray(formData.categories) ? formData.categories : [BlogCategory.NEWSROOM];
            const validCategories = currentCategories.filter(cat => 
                Object.values(BlogCategory).includes(cat)
            );
            const finalCategories = validCategories.length > 0 ? validCategories : [BlogCategory.NEWSROOM];

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
                categories: finalCategories,
            };

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

            await createPost(submitData);
            router.push("/admin");
        } catch (error) {
            console.error("Error creating blog post:", error);
            setErrors({
                submit: error instanceof Error ? error.message : "Failed to create blog post"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field: keyof BlogPostFormData, value: string | boolean | BlogCategory[]) => {
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
                uploaded_image_content_type: imageData.content_type,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                uploaded_image: "",
                uploaded_image_filename: "",
                uploaded_image_content_type: "",
            }));
        }
        
        if (errors.uploaded_image) {
            setErrors(prev => ({ ...prev, uploaded_image: "" }));
        }
    };

    const handleCategoryChange = (category: BlogCategory, checked: boolean) => {
        const currentCategories = Array.isArray(formData.categories) ? formData.categories : [BlogCategory.NEWSROOM];
        
        if (checked) {
            if (!currentCategories.includes(category)) {
                const newCategories = [...currentCategories, category];
                updateField("categories", newCategories);
            }
        } else {
            const newCategories = currentCategories.filter(c => c !== category);
            if (newCategories.length > 0) {
                updateField("categories", newCategories);
            } else {
                setErrors(prev => ({ ...prev, categories: "At least one category must be selected" }));
            }
        }
    };

    const handleBack = () => {
        if (formData.title || formData.content || formData.excerpt) {
            if (window.confirm("You have unsaved changes. Are you sure you want to go back?")) {
                router.push("/admin");
            }
        } else {
            router.push("/admin");
        }
    };

    const currentCategories = Array.isArray(formData.categories) ? formData.categories : [BlogCategory.NEWSROOM];

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
            <header className = "fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 py-6">
                <div className = "px-6 lg:px-12">
                    <div className = "flex items-center justify-between">
                        <div className = "flex items-center">
                            <button
                                onClick = {handleBack}
                                className = "p-3 mr-6 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <ArrowLeft className = "h-5 w-5" />
                            </button>
                            <div>
                                <h1 className = {`${dmSans.className} text-5xl font-light text-slate-900`}>
                                    Create New Post
                                </h1>
                                <p className = {`${inter.className} text-lg text-slate-600 mt-2`}>
                                    Write and publish your next blog article
                                </p>
                            </div>
                        </div>

                        <div className = "flex items-center space-x-4">
                            <button
                                type = "button"
                                onClick = {handleBack}
                                className = {`${inter.className} px-6 py-3 text-slate-700 bg-white border hover:cursor-pointer border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium`}
                                disabled = {submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type = "submit"
                                form = "blog-post-form"
                                disabled = {submitting || createLoading}
                                className = {`${inter.className} inline-flex items-center px-6 py-3 bg-slate-700 hover:cursor-pointer hover:scale-105 text-white font-medium rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                            >
                                {submitting ? (
                                    <>
                                        <div className = "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className = "h-4 w-4 mr-2" />
                                        Create Post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className = "pt-15 py-8 px-6 lg:px-8">
                <div className = "max-w-6xl mx-auto">
                    <form id = "blog-post-form" onSubmit = {handleSubmit} className = "space-y-8">
                        <div className = "bg-white rounded-xl border border-slate-200 p-8 shadow-md">
                            <label className = {`${dmSans.className} block text-xl font-light text-slate-900 mb-4`}>
                                Post Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type = "text"
                                value = {formData.title}
                                onChange = {(e) => updateField("title", e.target.value)}
                                className = {`${inter.className} w-full px-4 py-4 border-2 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder:text-slate-400 text-lg ${
                                    errors.title ? "border-red-300" : "border-slate-200"
                                }`}
                                placeholder = "Enter your blog post title..."
                                disabled = {submitting}
                            />
                            {errors.title && <p className={`${inter.className} mt-3 text-sm text-red-600`}>{errors.title}</p>}
                        </div>

                        <div className = "bg-white rounded-xl border border-slate-200 p-8">
                            <label className = {`${dmSans.className} block text-xl font-light text-slate-900 mb-4`}>
                                <Tag className = "h-5 w-5 inline mr-2" />
                                Categories <span className="text-red-500">*</span>
                            </label>  
                            <div className = "grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CATEGORY_OPTIONS.map((option) => (
                                    <label
                                        key = {option.value}
                                        className = {`flex items-start p-6 bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-slate-300 ${
                                            currentCategories.includes(option.value)
                                                ? "border-slate-500 bg-slate-50"
                                                : "border-slate-200"
                                        }`}
                                    >
                                        <input
                                            type = "checkbox"
                                            checked = {currentCategories.includes(option.value)}
                                            onChange = {(e) => handleCategoryChange(option.value, e.target.checked)}
                                            className = "h-5 w-5 text-slate-600 focus:ring-slate-500 border-slate-300 rounded mt-0.5"
                                            disabled = {submitting}
                                        />
                                        <div className = "ml-4">
                                            <span className = {`${dmSans.className} font-medium text-slate-900`}>
                                                {option.label}
                                            </span>
                                            <span className = {`${inter.className} block text-slate-500 text-sm leading-relaxed mt-1`}>
                                                {option.description}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>  
                            {errors.categories && <p className = {`${inter.className} mt-3 text-sm text-red-600`}> {errors.categories} </p>}
                            <p className = {`${inter.className} mt-4 text-sm text-slate-500`}>
                                Select one or more categories where this post will appear. Your post will be visible on all selected category pages.
                            </p>                    
                        </div>

                        <div className = "bg-white rounded-xl border border-slate-200 p-8">
                            <label className = {`${dmSans.className} block text-xl font-light text-slate-900 mb-4`}>
                                Main Image
                            </label>
                            <ImageUpload
                                value = {formData.uploaded_image}
                                filename = {formData.uploaded_image_filename}
                                contentType = {formData.uploaded_image_content_type}
                                onChange = {handleImageUpload}
                                disabled = {submitting}
                                error = {errors.uploaded_image}
                                maxSizeBytes = {1024 * 1024}
                                maxOriginalSizeBytes = {10 * 1024 * 1024}
                                acceptedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
                                compressionOptions = {{
                                    maxWidth: 1200,
                                    maxHeight: 800,
                                    quality: 0.8,
                                    maxSizeBytes: 1024 * 1024
                                }}
                            />
                            {errors.uploaded_image && <p className = {`${inter.className} mt-3 text-sm text-red-600`}> {errors.uploaded_image} </p>}
                        </div>

                        <div className = "grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className = "bg-white rounded-xl border border-slate-200 p-8">
                                <label className = {`${dmSans.className} block text-xl font-light text-slate-900 mb-4`}>
                                    Excerpt
                                </label>
                                <textarea
                                    value = {formData.excerpt || ""}
                                    onChange = {(e) => updateField("excerpt", e.target.value)}
                                    rows = {5}
                                    className = {`${inter.className} w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none placeholder:text-slate-400 ${
                                        errors.excerpt ? "border-red-300" : "border-slate-200"
                                    }`}
                                    placeholder = "Brief summary of your post..."
                                    disabled = {submitting}
                                />
                                {errors.excerpt && <p className = {`${inter.className} mt-3 text-sm text-red-600`}> {errors.excerpt} </p>}
                            </div>
                            <div className = "bg-white rounded-xl border border-slate-200 p-8">
                                <label className = {`${dmSans.className} block text-xl font-light text-slate-900 mb-4`}>
                                    Featured Image URL
                                </label>
                                <input
                                    type = "url"
                                    value = {formData.featured_image || ""}
                                    onChange = {(e) => updateField("featured_image", e.target.value)}
                                    className = {`${inter.className} w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder:text-slate-400 ${
                                        errors.featured_image ? "border-red-300" : "border-slate-200"
                                    }`}
                                    placeholder = "https://example.com/image.jpg"
                                    disabled = {submitting}
                                />
                                {errors.featured_image && <p className = {`${inter.className} mt-3 text-sm text-red-600`}> {errors.featured_image} </p>}
                            </div>
                        </div>

                        <div className = "bg-white rounded-xl border border-slate-200 p-8">
                            <label className = {`${dmSans.className} block text-xl font-light text-slate-900 mb-4`}>
                                Content <span className="text-red-500">*</span>
                            </label>
                            <RichTextEditor
                                value = {formData.content}
                                onChange = {(value) => updateField("content", value)}
                                disabled = {submitting}
                                error = {errors.content}
                                placeholder = "Start writing your post..."
                            />
                            {errors.content && <p className = {`${inter.className} mt-3 text-sm text-red-600`}> {errors.content} </p>}
                        </div>

                        <div className = "bg-white rounded-xl border border-slate-200 p-8">
                            <h3 className = {`${dmSans.className} text-xl font-light text-slate-900 mb-6`}> Publishing Options </h3>
                            <div className = "grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className = "flex items-center p-6 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                                    <input
                                        type = "checkbox"
                                        checked = {formData.is_published}
                                        onChange = {(e) => updateField("is_published", e.target.checked)}
                                        className = "h-5 w-5 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                                        disabled = {submitting}
                                    />
                                    <div className = "ml-4">
                                        <span className = {`${dmSans.className} font-medium text-slate-900`}> Publish Immediately </span>
                                        <span className = {`${inter.className} block text-slate-500 text-sm mt-1`}> Make visible to readers </span>
                                    </div>
                                </label>

                                <label className = "flex items-center p-6 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                                    <input
                                        type = "checkbox"
                                        checked = {formData.is_featured}
                                        onChange = {(e) => updateField("is_featured", e.target.checked)}
                                        className = "h-5 w-5 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
                                        disabled = {submitting}
                                    />
                                    <div className = "ml-4">
                                        <span className = {`${dmSans.className} font-medium text-slate-900`}> Mark as Featured </span>
                                        <span className = {`${inter.className} block text-slate-500 text-sm mt-1`}> Highlight on blog homepage </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        {errors.submit && (
                            <div className = "bg-red-50 border border-red-200 rounded-xl p-6">
                                <p className = {`${inter.className} text-sm text-red-700`} >{errors.submit} </p>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
};