// src/app/blog/[slug]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { blogService, BlogPost } from '@/services/blogService';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      
      // Fetch the specific post
      const fetchedPost = await blogService.getPostBySlug(slug);
      
      if (!fetchedPost) {
        setNotFound(true);
        return;
      }
      
      setPost(fetchedPost);
      
      // Fetch related posts (other recent posts)
      const allPosts = await blogService.getPublishedPosts();
      const related = allPosts
        .filter(p => p.id !== fetchedPost.id)
        .slice(0, 3);
      setRelatedPosts(related);
      
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post?.title || '';

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setShareMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            {/* Back button skeleton */}
            <div className="h-6 bg-gray-300 rounded w-24 mb-8"></div>
            
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            
            {/* Image skeleton */}
            <div className="h-96 bg-gray-300 rounded-xl mb-8"></div>
            
            {/* Content skeleton */}
            <div className="space-y-4">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="h-4 bg-gray-300 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/newsroom"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Newsroom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/newsroom"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Newsroom
        </Link>

        {/* Article Meta */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{blogService.formatDate(post.published_at || post.created_at)}</span>
            <span className="mx-2">•</span>
            <User className="h-4 w-4 mr-2" />
            <span>{blogService.getAuthorName(post)}</span>
            {post.is_featured && (
              <>
                <span className="mx-2">•</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  Featured
                </span>
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Share Button */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            
            {shareMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <div className="py-2">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Twitter className="h-4 w-4 mr-3 text-blue-400" />
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Linkedin className="h-4 w-4 mr-3 text-blue-700" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-3 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 mr-3 text-gray-600" />
                    )}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
        />

        {/* Author Bio */}
        <div className="border-t border-gray-200 pt-8 mb-12">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {post.author.first_name.charAt(0)}{post.author.last_name.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {blogService.getAuthorName(post)}
              </h4>
              <p className="text-gray-600">Administrator at AITHENA</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-gray-200 pt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={relatedPost.featured_image || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                      alt={relatedPost.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {blogService.getExcerpt(relatedPost, 100)}
                      </p>
                      <div className="mt-3 text-sm text-gray-500">
                        {blogService.formatDate(relatedPost.published_at || relatedPost.created_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close share menu */}
      {shareMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShareMenuOpen(false)}
        />
      )}
    </div>
  );
}