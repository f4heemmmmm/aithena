// src/app/sections/4-articles.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User, ExternalLink } from 'lucide-react';
import { blogService, BlogPost } from '@/services/blogService';

export default function ArticlesSection() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch featured posts for the main display
      const featured = await blogService.getFeaturedPosts();
      setFeaturedPosts(featured.slice(0, 3)); // Limit to 3 featured posts
      
      // Fetch recent published posts
      const published = await blogService.getPublishedPosts();
      setRecentPosts(published.slice(0, 6)); // Limit to 6 recent posts
      
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultArticles = [
    {
      id: 'default-1',
      title: "The Future of AI in Legal Research",
      excerpt: "Discover how artificial intelligence is revolutionizing the way legal professionals conduct research and analysis.",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      author: "AITHENA Team",
      date: "March 15, 2024",
      slug: "future-ai-legal-research"
    },
    {
      id: 'default-2',
      title: "Streamlining Case Management with Technology",
      excerpt: "Learn about the latest tools and technologies that are helping law firms manage cases more efficiently.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      author: "AITHENA Team",
      date: "March 10, 2024",
      slug: "streamlining-case-management"
    },
    {
      id: 'default-3',
      title: "Data Privacy in the Digital Age",
      excerpt: "Understanding the legal implications and best practices for data privacy in today's digital landscape.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      author: "AITHENA Team",
      date: "March 5, 2024",
      slug: "data-privacy-digital-age"
    }
  ];

  // Use blog posts if available, otherwise fallback to default articles
  const displayPosts = featuredPosts.length > 0 ? featuredPosts : recentPosts.slice(0, 3);
  const hasRealPosts = featuredPosts.length > 0 || recentPosts.length > 0;

  const renderArticleCard = (post: BlogPost | typeof defaultArticles[0], index: number) => {
    const isDefaultArticle = 'slug' in post && post.id.startsWith('default-');
    
    return (
      <div
        key={post.id}
        className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
          index === 0 ? 'md:col-span-2 md:row-span-2' : ''
        }`}
      >
        <div className="relative overflow-hidden">
          <img
            src={
              isDefaultArticle 
                ? (post as typeof defaultArticles[0]).image
                : (post as BlogPost).featured_image || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            }
            alt={post.title}
            className={`w-full object-cover transition-transform duration-300 hover:scale-105 ${
              index === 0 ? 'h-64' : 'h-48'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        
        <div className={`p-6 ${index === 0 ? 'md:p-8' : ''}`}>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {isDefaultArticle 
                ? (post as typeof defaultArticles[0]).date
                : blogService.formatDate((post as BlogPost).published_at || (post as BlogPost).created_at)
              }
            </span>
            <span className="mx-2">•</span>
            <User className="h-4 w-4 mr-2" />
            <span>
              {isDefaultArticle 
                ? (post as typeof defaultArticles[0]).author
                : blogService.getAuthorName(post as BlogPost)
              }
            </span>
          </div>
          
          <h3 className={`font-bold text-gray-900 mb-3 line-clamp-2 ${
            index === 0 ? 'text-2xl md:text-3xl' : 'text-xl'
          }`}>
            {post.title}
          </h3>
          
          <p className={`text-gray-600 mb-4 line-clamp-3 ${
            index === 0 ? 'text-lg' : 'text-base'
          }`}>
            {isDefaultArticle 
              ? (post as typeof defaultArticles[0]).excerpt
              : blogService.getExcerpt(post as BlogPost, index === 0 ? 200 : 120)
            }
          </p>
          
          {hasRealPosts ? (
            <Link
              href={`/blog/${isDefaultArticle ? (post as typeof defaultArticles[0]).slug : (post as BlogPost).slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Read more
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <div className="inline-flex items-center text-gray-400 font-medium">
              Coming soon
              <ExternalLink className="h-4 w-4 ml-2" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Articles & Insights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with our latest thoughts on AI, legal technology, and industry trends
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-max">
            {(displayPosts.length > 0 ? displayPosts : defaultArticles).map((post, index) => 
              renderArticleCard(post, index)
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/newsroom"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Articles
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}