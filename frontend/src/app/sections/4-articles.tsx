"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Inter, DM_Sans } from "next/font/google";
import { ArrowRight, Calendar, User } from "lucide-react";

import NoArticles from "@/components/NoArticles";
import { blogService, BlogPost } from "@/services/blogService";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

export default function ArticlesSection() {
    const [loading, setLoading] = useState(true);
    const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        try {
            setLoading(true);
            const recent = await blogService.getRecentPosts(3);
            setRecentPosts(recent);
        } catch (error) {
            console.error("Error fetching blog posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const displayPosts = recentPosts.slice(0, 3);
    const hasRealPosts = recentPosts.length > 0;

    const renderLoadingSkeleton = () => (
        <div className = "grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[400px]">
            {[...Array(3)].map((_, index) => (
                <div 
                    key = {index} 
                    className = {`bg-white rounded-xl shadow-lg overflow-hidden animate-pulse ${
                        index === 0 ? "md:col-span-2 md:row-span-2" : ""
                    }`}
                >
                    <div className = {`bg-gray-300 ${index === 0 ? "h-64" : "h-48"}`} />
                    <div className = {`p-6 ${index === 0 ? "md:p-8" : ""}`}>
                        <div className = "h-4 bg-gray-300 rounded w-1/2 mb-3" />
                        <div className = {`bg-gray-300 rounded w-3/4 mb-3 ${index === 0 ? "h-8" : "h-6"}`} />
                        <div className = "h-4 bg-gray-300 rounded w-full mb-2" />
                        <div className = "h-4 bg-gray-300 rounded w-2/3 mb-4" />
                        <div className = "h-4 bg-gray-300 rounded w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderArticlesGrid = () => {
        const getGridClasses = () => {
            if (displayPosts.length === 1) {
                return "flex justify-center";
            } else if (displayPosts.length === 2) {
                return "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto";
            } else {
                return "grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-max";
            }
        };

        return (
            <>
                <div className = {`${getGridClasses()} min-h-[400px]`}>
                    {displayPosts.map((post, index) => {
                        const shouldBeMainCard = displayPosts.length >= 3 && index === 0;
                        return (
                            <Link
                                key = {post.id}
                                href = {`/blog/${post.slug}`}
                                className = {`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer block ${
                                    shouldBeMainCard ? "md:col-span-2 md:row-span-2" : ""
                                } ${displayPosts.length === 1 ? "max-w-md" : ""}`}
                            >
                                <div className = "relative overflow-hidden">
                                    <img
                                        src = {blogService.getMainImage(post) || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                        alt = {blogService.getImageAlternative(post)}
                                        className = {`w-full object-cover transition-transform duration-300 hover:scale-105 ${
                                            shouldBeMainCard ? "h-64" : "h-48"
                                        }`}
                                    />
                                    <div className = "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                                <div className = {`p-6 ${shouldBeMainCard ? "md:p-8" : ""}`}>
                                    <div className = {`${inter.className} flex items-center font-sm text-base text-gray-400 mb-3`}>
                                        <Calendar className = "h-4 w-4 mr-2" />
                                        <span>
                                            {blogService.formatDate(post.published_at || post.created_at)}
                                        </span>
                                        <span className = "mx-2 font-light"> | </span>
                                        <User className = "h-4 w-4 mr-2" />
                                        <span>
                                            {blogService.getAuthorName(post)}
                                        </span>
                                    </div>

                                    <h3 className = {`${dmSans.className} font-thin text-gray-900 mb-3 line-clamp-2 ${
                                        shouldBeMainCard ? "text-5xl md:text-7xl" : "text-3xl"
                                    }`}>
                                        {post.title}
                                    </h3>

                                    <p className = {`${inter.className} text-gray-600 mb-4 font-light line-clamp-3 leading-relaxed ${
                                        shouldBeMainCard ? "text-xl" : "text-lg"
                                    }`}>
                                        {(() => {
                                            const excerpt = blogService.getExcerpt(post, shouldBeMainCard ? 200 : 120);
                                            const firstSentence = excerpt.split(".")[0];
                                            return firstSentence.length < excerpt.length ? `${firstSentence}...` : excerpt;
                                        })()}
                                    </p>
                                    
                                    <div className = {`${inter.className} inline-flex items-center text-blue-600 hover:text-blue-700 font-2xl transition-colors group`}>
                                        Read more
                                        <ArrowRight className = "h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div> 
            </>
        );
    };
    
    return (
        <section id = "articles-section" className = "py-20 bg-gray-50">
            <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className = "text-center mb-16">
                    <h2 className = {`${dmSans.className} text-8xl font-mono text-blue-900 mb-4`}>
                        Latest Articles and Insights
                    </h2>
                    <p className = {`${inter.className} text-xl text-gray-600 max-w-7xl mx-auto leading-relaxed`}>
                        AITHENA Articles & Insights is your one-stop chronicle of our journey - showcasing the awards that recognize our progress, the thought pieces that push legal-AI discourse forward, and the milestone events that mark each step along the way.
                    </p>
                </div>
                {loading ? renderLoadingSkeleton() : hasRealPosts ? renderArticlesGrid() : <NoArticles />}
            </div>
        </section>
    );
};