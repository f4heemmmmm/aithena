"use client";

import Link from "next/link";
import { Inter, DM_Sans } from "next/font/google";
import React, { useEffect, useState, useRef } from "react";
import { Calendar, User, ArrowRight, Search, Eye, Tag, AlertCircle } from "lucide-react";

import NoArticles from "./NoArticles";
import { BlogPost, BlogCategory, blogService } from "@/services/blogService";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

const NAVIGATION_CATEGORIES = [
    {
        label: "Newsroom",
        path: "/newsroom",
        category: null,
        description: "Stay updated with the latest news, insights, and developments from AITHENA."
    },
    {
        label: "Thought Pieces",
        path: "/newsroom/thought-pieces",
        category: BlogCategory.THOUGHT_PIECES,
        description: "Explore our in-depth analysis, though leadership articles, and expert insights on industry trends and innovation."
    },
    {
        label: "Achievements",
        path: "/newsroom/achievements",
        category: BlogCategory.ACHIEVEMENTS,
        description: "Discover our latest milestones, company successes, and significant achievements that mark our journey forward."
    },
    {
        label: "Awards & Recognition",
        path: "/newsroom/awards-recognition",
        category: BlogCategory.AWARDS_RECOGNITION,
        description: "Celebrating our industry awards, recognitions and accolades that acknowledge our commitment to excellence and innovation."
    }
];

interface CategoryPageProps {
    category: BlogCategory | null;
    title: string;
    description: string;
    currentPath: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const postsCache = new Map<string, { posts: BlogPost[]; featuredPosts: BlogPost[]; timestamp: number;}>();

export default function CategoryPage({ category, title, description, currentPath }: CategoryPageProps) {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

    // useRef()
    const contentRef = useRef<HTMLDivElement>(null);
    const previousCategoryRef = useRef<BlogCategory | null | undefined>(undefined);

    const fetchCategoryPosts = React.useCallback(async () => {
        try {
            setError(null);

            const cacheKey = category ? category : "all";

            const now = Date.now();
            const cached = postsCache.get(cacheKey);

            if (cached && (now - cached.timestamp) < CACHE_DURATION) {
                console.log("Using cached data for category:", cacheKey);
                setPosts(cached.posts);
                setFilteredPosts(cached.posts);
                setFeaturedPosts(cached.featuredPosts);
                setLoading(false);
                return;
            }
            
            setLoading(true);
            console.log("Fetching posts for category: ", cacheKey);

            let categoryPosts: BlogPost[];

            if (category === null) {
                categoryPosts = await blogService.getPublishedPosts();
            } else {
                categoryPosts = await blogService.getPostsByCategory(category);
            }

            console.log(`Found ${categoryPosts.length} posts in category`);

            const featuredInCategory = categoryPosts.filter(post => post.is_featured).slice(0, 3);

            postsCache.set(cacheKey, {
                posts: categoryPosts,
                featuredPosts: featuredInCategory,
                timestamp: now
            });

            setPosts(categoryPosts);
            setFilteredPosts(categoryPosts);
            setFeaturedPosts(featuredInCategory);
        } catch (error) {
            console.error("Error fetching category posts: ", error);
            setError("Failed to load articles. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        if (previousCategoryRef.current !== undefined && previousCategoryRef.current !== category) {
            setIsTransitioning(true);
            setTimeout(() => {
                fetchCategoryPosts();
                setIsTransitioning(false);
            }, 150);
        } else {
            fetchCategoryPosts();
        }
        previousCategoryRef.current = category;
    }, [category, fetchCategoryPosts]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredPosts(posts);
        } else {
            const filtered = posts.filter(post => 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredPosts(filtered);
        }
    }, [posts, searchTerm]);

    const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleClearSearch = React.useCallback(() => {
        setSearchTerm("");
    }, []);

    const handleRetry = React.useCallback(() => {
        const cacheKey = category ? category : "all";
        postsCache.delete(cacheKey);
        fetchCategoryPosts();
    },[category, fetchCategoryPosts]);

    const getMainImage = React.useCallback((post: BlogPost): string => {
        const mainImage = blogService.getMainImage(post);
        return mainImage || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
    }, []);

    const getAlternativeImage = React.useCallback((post: BlogPost): string => {
        return blogService.getAlternativeImage(post);
    }, []);

    const getCategoryBadgeColor = React.useCallback((category: BlogCategory): string => {
        const colors = {
            [BlogCategory.NEWSROOM]: "bg-blueget-100 text-blue-800 border-blue-200",
            [BlogCategory.THOUGHT_PIECES]: "bg-purple-100 text-purple-800 border-purple-200",
            [BlogCategory.ACHIEVEMENTS]: "bg-green-100 text-green-800 border-green-200",
            [BlogCategory.AWARDS_RECOGNITION]: "bg-yellow-100 text-yellow-800 border-yellow-200"
        };
        return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
    }, []);

    const renderCategoryBadges = React.useCallback((categories: BlogCategory[]) => {
        if (!categories || categories.length === 0) {
            return (
                <div className = "flex flex-wrap gap-1 mb-2">
                    <span className = "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        No Category
                    </span>
                </div>
            );
        }

        let categoryArray: BlogCategory[];
        if (Array.isArray(categories)) {
            categoryArray = categories;
        } else if (typeof categories === "string") {
            categoryArray = [categories as BlogCategory];
        } else {
            categoryArray = [BlogCategory.NEWSROOM];
        }

        const validCategories = categoryArray.filter(cat => 
            Object.values(BlogCategory).includes(cat)
        );

        if (validCategories.length === 0) {
            validCategories.push(BlogCategory.NEWSROOM);
        }

        return (
            <div className = "flex flex-wrap gap-1 mb-2">
                {validCategories.slice(0, 3).map((cat, index) => (
                    <span
                        key = {`${cat}-${index}`}
                        className = {`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryBadgeColor(cat)}`}
                    >
                        {blogService.getCategoryLabel(cat)}
                    </span>
                ))}
                {validCategories.length > 3 && (
                    <span className = "px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        +{validCategories.length - 3} more
                    </span>
                )}
            </div>
        );
    }, [getCategoryBadgeColor]);

    const renderLoadingSkeleton = () => (
        <div className = "min-h-screen bg-gray-50">
            <div className = "bg-white border-b border-gray-200">
                <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className = "text-center">
                        <div className = "h-12 bg-gray-300 rounded-lg w-1/2 mx-auto mb-6 animate-pulse" style = {{ animationDelay: "0ms" }} />
                        <div className = "h-6 bg-gray-300 rounded-lg w-3/4 mx-auto mb-8 animate-pulse" style = {{ animationDelay: "100ms" }} />
                        <div className = "flex flex-wrap justify-center gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div 
                                    key = {i} 
                                    className = "h-6 bg-gray-300 rounded w-24 animate-pulse" 
                                    style = {{ animationDelay: `${200 + i * 50}ms` }}
                                />
                            ))}
                        </div>
                        <div className = "h-12 bg-gray-300 rounded-lg w-1/3 mx-auto animate-pulse" style = {{ animationDelay: "400ms" }} />
                    </div>
                </div>
            </div>

            <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className = "mb-16">
                    <div className = "h-8 bg-gray-300 rounded w-48 mb-8 animate-pulse" style = {{ animationDelay: "500ms" }} />
                    <div className = "grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[...Array(2)].map((_, index) => (
                            <div 
                                key = {index} 
                                className = "bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                                style = {{ animationDelay: `${600 + index * 100}ms` }}
                            >
                                <div className = "bg-gray-300 h-64" />
                                <div className = "p-6">
                                    <div className = "h-4 bg-gray-300 rounded w-1/3 mb-3" />
                                    <div className = "h-6 bg-gray-300 rounded w-3/4 mb-3" />
                                    <div className = "h-4 bg-gray-300 rounded w-full mb-2" />
                                    <div className = "h-4 bg-gray-300 rounded w-2/3 mb-4" />
                                    <div className = "h-4 bg-gray-300 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className = "mb-8">
                    <div className = "h-8 bg-gray-300 rounded w-32 mb-8 animate-pulse" style = {{ animationDelay: "800ms" }} />
                </div>

                <div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, index) => (
                        <div 
                            key = {index} 
                            className = "bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                            style = {{ animationDelay: `${900 + index * 50}ms` }}
                        >
                            <div className = "bg-gray-300 h-48" />
                            <div className = "p-6">
                                <div className = "h-4 bg-gray-300 rounded w-1/3 mb-3" />
                                <div className = "h-6 bg-gray-300 rounded w-3/4 mb-3" />
                                <div className = "h-4 bg-gray-300 rounded w-full mb-2" />
                                <div className = "h-4 bg-gray-300 rounded w-2/3 mb-4" />
                                <div className = "h-4 bg-gray-300 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderErrorState = () => (
        <div className = "min-h-screen bg-gray-50 flex items-center justify-center">
            <div className = "text-center max-w-md mx-auto px-4 animate-fade-in">
                <div className = "mb-6">
                    <AlertCircle className = "h-16 w-16 text-red-500 mx-auto mb-4 animate-bounce" />
                    <h3 className = {`${dmSans.className} text-2xl font-semibold text-gray-900 mb-2`}>
                        Uh oh! Something went wrong...
                    </h3>
                    <p className = {`${inter.className} text-gray-600 mb-6`}>
                        {error}
                    </p>
                </div>
                <button
                    onClick = {handleRetry}
                    className = "w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    if (loading) {
        return renderLoadingSkeleton();
    }

    if (error) {
        return renderErrorState();
    }

    const hasRealPosts = featuredPosts.length > 0 || posts.length > 0;

    return (
        <div className = "min-h-screen bg-gray-50">
            <div className = "bg-white border-b border-gray-200">
                <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className = "text-center">
                        <h1 className = {`${dmSans.className} text-5xl md:text-6xl font-semibold text-gray-900 mb-10 transition-all duration-300 ${isTransitioning ? "opacity-50 transform scale-95" : "opacity-100 transform scale-100"}`}>
                            {title}
                        </h1>
                        <p className = {`${inter.className} text-xl text-gray-600 max-w-9xl mx-auto mb-12 transition-all duration-300 delay-75 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
                            {description}
                        </p>

                        {/* NAVIGATION LINKS */}
                        <div className="flex flex-wrap justify-center gap-16 mb-8">
                            {NAVIGATION_CATEGORIES.map((item, index) => (
                                <Link
                                    key = {item.path}
                                    href = {item.path}
                                    className = {`${inter.className} text-xl transition-all duration-300 transform hover:scale-105 relative ${
                                        item.path === currentPath 
                                            ? "text-blue-600 font-semibold" 
                                            : "text-gray-600 hover:text-blue-600 font-light"
                                    } before:content-[""] before:absolute before:w-0 before:h-0.5 before:-bottom-1 before:left-0 before:bg-blue-600 before:transition-all before:duration-300 hover:before:w-full`}
                                    style = {{ transitionDelay: `${index * 50}ms` }}
                                > 
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* SEARCH BAR */}
                        {hasRealPosts && (
                            <div className = {`max-w-2xl mx-auto transition-all duration-300 delay-150 ${isTransitioning ? "opacity-50" : "opacity-100"}`}>
                                <div className = "relative">
                                    <Search className = "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-200" />
                                    <input
                                        type = "text"
                                        placeholder = "Search articles..."
                                        value = {searchTerm}
                                        onChange = {handleSearchChange}
                                        className = {`${inter.className} w-full pl-12 pr-4 py-4 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 focus:shadow-md`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div 
                ref = {contentRef}
                className = {`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-all duration-300 ${isTransitioning ? "opacity-50 transform translate-y-4" : "opacity-100 transform translate-y-0"}`}
            >
                {!hasRealPosts ? (
                    <NoArticles />
                ) : (
                    <>
                        {/* FEATURED ARTICLES */}
                        {featuredPosts.length > 0 && searchTerm === "" && (
                            <div className = "mb-16 animate-fade-in-up" style = {{ animationDelay: "200ms" }}>
                                <div className = "flex items-center justify-between mb-8">
                                    <h2 className = {`${dmSans.className} text-3xl font-bold text-gray-900`}>
                                        Featured Articles
                                    </h2>
                                    <div className = "flex items-center text-sm text-gray-500">
                                        <Tag className = "h-4 w-4 mr-1" />
                                        {featuredPosts.length} featured
                                    </div>
                                </div>
                                
                                <div className = "grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {featuredPosts.map((post, index) => (
                                        <Link
                                            key = {post.id}
                                            href = {`/blog/${post.slug}`}
                                            className = "group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                                            style = {{ animationDelay: `${300 + index * 100}ms` }}
                                        >
                                            <div className = "relative overflow-hidden">
                                                <img
                                                    src = {getMainImage(post)}
                                                    alt = {getAlternativeImage(post)}
                                                    className = "w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                                                    onError = {(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                                                    }}
                                                />
                                                <div className = "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                <div className = "absolute top-4 left-4">
                                                    <span className = "bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                        Featured
                                                    </span>
                                                </div>
                                            </div>
                                        
                                            <div className = "p-6">
                                                {renderCategoryBadges(post.categories)}
                                                <div className = {`${inter.className} flex items-center text-sm text-gray-500 mb-3`}>
                                                    <Calendar className = "h-4 w-4 mr-2" />
                                                    <span>
                                                        {blogService.formatDate(post.published_at || post.created_at)}
                                                    </span>
                                                    <span className = "mx-2">•</span>
                                                    <User className = "h-4 w-4 mr-2" />
                                                    <span>
                                                        {blogService.getAuthorName(post)}
                                                    </span>
                                                    <span className = "mx-2">•</span>
                                                    <Eye className = "h-4 w-4 mr-2" />
                                                    <span>
                                                        {blogService.formatViewCount(post.view_count)}
                                                    </span>
                                                </div>
                                                
                                                <h3 className = {`${dmSans.className} text-2xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors`}>
                                                    {post.title}
                                                </h3>
                                                
                                                <p className = {`${inter.className} text-gray-600 mb-4 line-clamp-3 leading-relaxed`}>
                                                    {blogService.getExcerpt(post, 200)}
                                                </p>
                                                
                                                <div className = "flex items-center justify-between">
                                                    <div className = {`${inter.className} inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors`}>
                                                        Read article
                                                        <ArrowRight className = "h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                    <div className = {`${inter.className} text-sm text-gray-500`}>
                                                        {blogService.formatReadingTime(post.content)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ALL ARTICLES */}
                        <div className = "mb-8 animate-fade-in-up" style = {{ animationDelay: "400ms" }}>
                            <div className = "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                <h2 className = {`${dmSans.className} text-3xl font-bold text-gray-900`}>
                                    {searchTerm ? (
                                        <>
                                            Search Results 
                                            <span className = "text-blue-600">({filteredPosts.length})</span>
                                        </>
                                    ) : (
                                        "All Articles"
                                    )}
                                </h2>
                                {!searchTerm && (
                                    <div className = "flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        <Tag className = "h-4 w-4 mr-1" />
                                        {posts.length} article{posts.length !== 1 ? "s" : ""}
                                    </div>
                                )}
                            </div>
                            
                            {searchTerm && (
                                <div className = "mt-2">
                                    <span className = {`${inter.className} text-sm text-gray-500`}>
                                        Showing results for "{searchTerm}"
                                    </span>
                                    <button
                                        onClick={handleClearSearch}
                                        className = "ml-3 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>

                        {filteredPosts.length === 0 ? (
                            <NoArticles 
                                searchTerm = {searchTerm}
                                onClearSearch = {handleClearSearch}
                                variant = "search"
                            />
                        ) : (
                            <div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPosts.map((post, index) => (
                                    <Link
                                        key = {post.id}
                                        href = {`/blog/${post.slug}`}
                                        className = "group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                                        style = {{ animationDelay: `${500 + index * 50}ms` }}
                                    >
                                        <div className = "relative overflow-hidden">
                                            <img
                                                src = {getMainImage(post)}
                                                alt = {getAlternativeImage(post)}
                                                className = "w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError = {(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                                                }}
                                            />
                                            <div className = "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                            {post.is_featured && (
                                                <div className = "absolute top-4 left-4">
                                                    <span className = "bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                        Featured
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    
                                        <div className = "p-6">
                                            {renderCategoryBadges(post.categories)}
                                            <div className = {`${inter.className} flex items-center text-sm text-gray-500 mb-3`}>
                                                <Calendar className = "h-4 w-4 mr-2" />
                                                <span>
                                                    {blogService.formatDate(post.published_at || post.created_at)}
                                                </span>
                                                <span className = "mx-2">•</span>
                                                <User className = "h-4 w-4 mr-2" />
                                                <span>
                                                    {blogService.getAuthorName(post)}
                                                </span>
                                                <span className = "mx-2 hidden sm:inline">•</span>
                                                <Eye className = "h-4 w-4 mr-2 hidden sm:inline" />
                                                <span className = "hidden sm:inline">
                                                    {blogService.formatViewCount(post.view_count)}
                                                </span>
                                            </div>
                                            
                                            <h3 className = {`${dmSans.className} text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors`}>
                                                {post.title}
                                            </h3>
                                            
                                            <p className = {`${inter.className} text-gray-600 mb-4 line-clamp-3 leading-relaxed`}>
                                                {blogService.getExcerpt(post, 150)}
                                            </p>
                                            
                                            <div className = "flex items-center justify-between">
                                                <div className = {`${inter.className} inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors`}>
                                                    Read article
                                                    <ArrowRight className = "h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                                </div>
                                                <div className = {`${inter.className} text-sm text-gray-500`}>
                                                    {blogService.formatReadingTime(post.content)}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ENHANCED STYLES */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};