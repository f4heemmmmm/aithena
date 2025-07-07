// TO BE REFACTORED AND DESIGN TO BE CHANGED
// Idea: To have carousell for posts, limit to the recent posts (6?)
// Make centralized if have post, and split equally dynamically when there's more

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar, User, ExternalLink } from "lucide-react";

import { blogService, BlogPost } from "@/services/blogService";

export default function ArticlesSection() {
    const [loading, setLoading] = useState(true);
    const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
    const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        try {
            setLoading(true);

            const featured = await blogService.getFeaturedPosts();
            setFeaturedPosts(featured.slice(0, 3));

            const published = await blogService.getPublishedPosts();
            setRecentPosts(published.slice(0, 6));
        } catch (error) {
            console.error("Error fetching blog posts", error);
        } finally {
            setLoading(false);
        }
    };

    const displayPosts = featuredPosts.length > 0 ? featuredPosts : recentPosts.slice(0, 3);
    const hasRealPosts = featuredPosts.length > 0 || recentPosts.length > 0;

    const renderArticleCard = (post: BlogPost, index: number) => {
        return (
            <div
                key = {post.id}
                className = {`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
            >
                <div className = "relative overflow-hidden">
                    <img
                        src = {post.featured_image || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                        alt = {post.title}
                        className = {`w-full object-cover transition-transform duration-300 hover:scale-105 ${
                            index === 0 ? "h-64" : "h-48"
                        }`}
                    />
                    <div className = "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className = {`p-6 ${index === 0 ? "md:p-8" : ""}`}>
                    <div className = "flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className = "h-4 w-4 mr-2" />
                        <span>
                            {blogService.formatDate(post.published_at || post.created_at)}
                        </span>
                        <span className = "mx-2">•</span>
                        <User className = "h-4 w-4 mr-2" />
                        <span>
                            {blogService.getAuthorName(post)}
                        </span>
                    </div>

                    <h3 className = {`font-bold text-gray-900 mb-3 line-clamp-2 ${
                        index === 0 ? "text-2xl md:text-3xl" : "text-xl"
                    }`}>
                        {post.title}
                    </h3>

                    <p className = {`text-gray-600 mv-4 line-clamp-3 ${
                        index === 0 ? "text-lg" : "text-base"
                    }`}>
                        {blogService.getExcerpt(post, index === 0 ? 200 : 120)}
                    </p>

                    <Link
                        href = {`/blog/${post.slug}`}
                        className = "inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        Read more
                        <ArrowRight className = "h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        );
    };

    const renderNoArticles = () => (
        <div className = "text-center py-16">
            <div className = "max-w-md mx-auto">
                <h3 className = "text-xl font-medium text-gray-900 mb-2">
                    No Articles Yet
                </h3>
                <p className = "text-gray-500">
                    Coming Soon...
                </p>
            </div>
        </div>
    );

    return (
        <section id = "articles-section" className = "py-20 bg-gray-50">
            <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className = "text-center mb-16">
                    <h2 className = "text-6xl font-semibold text-blue-900 mb-4">
                        Latest Articles and Insights
                    </h2>
                    <p className = "text-xl text-gray-600 max-w-3xl mx-auto">
                        Stay informed with our latest posts, thoughts on AI, and industry trends.
                    </p>
                </div>

                {loading ? (
                    <div className = "grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, index) => (
                            <div key = {index} className = "bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                                <div className = "h-48 bg-gray-300" />
                                <div className = "p-6">
                                    <div className = "h-4 bg-gray-300 rounded w-1/2 mb-3" />
                                    <div className = "h-6 bg-gray-300 rounded w-3/4 mb-3" />
                                    <div className = "h-4 bg-gray-300 rounded w-full mb-2" />
                                    <div className = "h-4 bg-gray-300 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : hasRealPosts ? (
                    <>
                        <div className = "grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-max">
                            {displayPosts.map((post, index) => renderArticleCard(post, index))}
                        </div>

                        <div className = "text-center mt-12">
                            <Link
                                href = "/newsroom"
                                className = "inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View All Articles
                                <ArrowRight className = "h-5 w-5 ml-2" />
                            </Link>
                        </div>
                    </>
                ) : (
                    renderNoArticles()
                )}
            </div>
        </section>
    );
};