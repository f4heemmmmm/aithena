// src/app/blog/[slug]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, Check, Eye } from 'lucide-react';
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
  const [viewCountIncremented, setViewCountIncremented] = useState(false);

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
      
      // Increment view count (only once per page load)
      if (!viewCountIncremented) {
        await blogService.incrementViewCount(slug);
        setViewCountIncremented(true);
        
        // Update the post with incremented view count
        setPost(prev => prev ? { ...prev, view_count: prev.view_count + 1 } : null);
      }
      
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

  const handleShare = async (platform: string) => {
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
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy URL:', error);
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        setShareMenuOpen(false);
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
    setShareMenuOpen(false);
  };

  const getMainImage = (post: BlogPost) => {
    return blogService.getMainImage(post);
  };

  const getAlternativeImage = (post: BlogPost) => {
    return blogService.getAlternativeImage(post);
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

  const mainImage = getMainImage(post);
  const imageAlt = getAlternativeImage(post);

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{blogService.formatDate(post.published_at || post.created_at)}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>{blogService.getAuthorName(post)}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span>{blogService.formatViewCount(post.view_count)} views</span>
            </div>
            {post.is_featured && (
              <>
                <span className="hidden sm:inline">•</span>
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
          <div className="text-sm text-gray-500">
            {blogService.formatReadingTime(post.content)}
          </div>
          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </button>
            
            {shareMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-700">Share this article</p>
                  </div>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Facebook className="h-5 w-5 mr-3 text-blue-600" />
                    Share on Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Twitter className="h-5 w-5 mr-3 text-blue-400" />
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 mr-3 text-blue-700" />
                    Share on LinkedIn
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-5 w-5 mr-3 text-green-600" />
                          <span className="text-green-600 font-medium">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5 mr-3 text-gray-600" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Image - Uploaded or Featured */}
        {mainImage && (
          <div className="mb-8">
            <img
              src={mainImage}
              alt={imageAlt}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Fallback to default image if both uploaded and featured images fail
                if (target.src !== "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80") {
                  target.src = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                }
              }}
            />
            {/* Image caption if filename is available */}
            {post.uploaded_image_filename && (
              <p className="text-sm text-gray-500 text-center mt-2 italic">
                {post.uploaded_image_filename}
              </p>
            )}
          </div>
        )}

        {/* Article Content - Updated container */}
        <div className="mb-12">
          <div 
            className="blog-content-container"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* New Sharing Section - Based on the attached image */}
        <div className="border-t border-gray-200 pt-8 mb-12">
          <div className="space-y-6">

            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="h-7 w-7" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 text-gray-600 hover:text-blue-400 transition-colors"
                title="Share on Twitter"
              >
                <Twitter className="h-7 w-7" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 text-gray-600 hover:text-blue-700 transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="h-7 w-7" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Copy link"
              >
                {copied ? (
                  <Check className="h-7 w-7 text-green-600" />
                ) : (
                  <Copy className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </div>

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
              <p className="text-sm text-gray-500 mt-1">
                Published {blogService.formatDate(post.published_at || post.created_at)}
              </p>
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
                      src={getMainImage(relatedPost) || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                      alt={getAlternativeImage(relatedPost)}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                      }}
                    />
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {blogService.getExcerpt(relatedPost, 100)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{blogService.formatDate(relatedPost.published_at || relatedPost.created_at)}</span>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{blogService.formatViewCount(relatedPost.view_count)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Blog Content Styling - Updated to match RichTextEditor exactly */}
      <style jsx global>{`
        /* Blog content container styling - matches RichTextEditor exactly */
        .blog-content-container {
          max-width: none;
          color: #000000;
          line-height: 1.6;
          font-size: 16px;
        }

        /* Typography hierarchy - exact match with RichTextEditor */
        .blog-content-container h1 { 
          font-size: 2.5em !important; 
          font-weight: 700 !important; 
          margin: 0.8em 0 0.4em 0 !important; 
          line-height: 1.2 !important;
          color: #111827 !important;
        }
        
        .blog-content-container h2 { 
          font-size: 2em !important; 
          font-weight: 600 !important; 
          margin: 0.7em 0 0.35em 0 !important; 
          line-height: 1.3 !important;
          color: #1f2937 !important;
        }
        
        .blog-content-container h3 { 
          font-size: 1.5em !important; 
          font-weight: 600 !important; 
          margin: 0.6em 0 0.3em 0 !important; 
          line-height: 1.4 !important;
          color: #374151 !important;
        }
        
        .blog-content-container h4 { 
          font-size: 1.25em !important; 
          font-weight: 600 !important; 
          margin: 0.5em 0 0.25em 0 !important; 
          line-height: 1.4 !important;
          color: #4b5563 !important;
        }
        
        .blog-content-container p { 
          font-size: 1em !important;
          margin: 0.5em 0 !important; 
          line-height: 1.6 !important;
          color: #374151 !important;
        }

        /* Enhanced blockquotes */
        .blog-content-container blockquote {
          border-left: 4px solid #3b82f6 !important;
          padding: 1em 1.5em !important;
          margin: 1.5em 0 !important;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
          font-style: italic !important;
          color: #4b5563 !important;
          position: relative !important;
        }

        .blog-content-container blockquote::before {
          content: '"' !important;
          font-size: 4em !important;
          color: #cbd5e1 !important;
          position: absolute !important;
          top: -0.2em !important;
          left: 0.3em !important;
          font-family: Georgia, serif !important;
          line-height: 1 !important;
        }

        .blog-content-container blockquote p {
          margin: 0.5em 0 !important;
          position: relative !important;
          z-index: 1 !important;
        }
        
        /* Enhanced nested lists - exact match with RichTextEditor */
        .blog-content-container ul { 
          padding-left: 1.5em !important; 
          margin: 1em 0 !important;
          list-style: none !important;
        }

        .blog-content-container ul li {
          position: relative !important;
          margin: 0.5em 0 !important;
          line-height: 1.6 !important;
          padding-left: 1.5em !important;
          display: list-item !important;
        }

        /* Level 1: Filled circle (bullet) */
        .blog-content-container ul li::before {
          content: "•" !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          color: #374151 !important;
          font-weight: bold !important;
          font-size: 1.2em !important;
          line-height: 1.3 !important;
        }

        /* Level 2: Filled square */
        .blog-content-container ul ul {
          list-style: none !important;
          margin: 0.25em 0 !important;
          padding-left: 1.5em !important;
        }

        .blog-content-container ul ul li::before {
          content: "▪" !important;
          font-size: 1em !important;
          top: 0.1em !important;
        }

        /* Level 3: Hollow circle */
        .blog-content-container ul ul ul {
          list-style: none !important;
          margin: 0.25em 0 !important;
          padding-left: 1.5em !important;
        }

        .blog-content-container ul ul ul li::before {
          content: "◦" !important;
          font-size: 1.1em !important;
          top: 0.05em !important;
        }

        /* Level 4+: Small filled circle */
        .blog-content-container ul ul ul ul li::before {
          content: "‣" !important;
          font-size: 1em !important;
          top: 0.1em !important;
        }

        /* Ordered lists */
        .blog-content-container ol { 
          padding-left: 1.5em !important; 
          margin: 1em 0 !important;
          list-style-type: decimal !important;
        }

        .blog-content-container ol li { 
          margin: 0.5em 0 !important; 
          line-height: 1.6 !important;
          display: list-item !important;
          padding-left: 0.5em !important;
        }

        /* Nested ordered lists */
        .blog-content-container ol ol {
          list-style-type: lower-alpha !important;
          margin: 0.25em 0 !important;
          padding-left: 1.5em !important;
        }

        .blog-content-container ol ol ol {
          list-style-type: lower-roman !important;
          margin: 0.25em 0 !important;
          padding-left: 1.5em !important;
        }
        
        /* Text formatting */
        .blog-content-container a { 
          color: #3b82f6 !important; 
          text-decoration: underline !important; 
          cursor: pointer !important;
          transition: color 0.15s ease !important;
        }

        .blog-content-container a:hover {
          color: #1d4ed8 !important;
        }
        
        .blog-content-container strong, 
        .blog-content-container b { 
          font-weight: 700 !important; 
        }
        
        .blog-content-container em, 
        .blog-content-container i { 
          font-style: italic !important; 
        }

        .blog-content-container u {
          text-decoration: underline !important;
        }

        .blog-content-container s {
          text-decoration: line-through !important;
        }
        
        /* Inline code */
        .blog-content-container code {
          background: #f3f4f6 !important;
          color: #dc2626 !important;
          padding: 0.2em 0.4em !important;
          border-radius: 0.25rem !important;
          font-family: "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace !important;
          font-size: 0.9em !important;
          border: 1px solid #d1d5db !important;
        }

        /* Text alignment */
        .blog-content-container [style*="text-align: left"] {
          text-align: left !important;
        }

        .blog-content-container [style*="text-align: center"] {
          text-align: center !important;
        }

        .blog-content-container [style*="text-align: right"] {
          text-align: right !important;
        }

        /* Color preservation - preserve inline color styles */
        .blog-content-container [style*="color:"] {
          /* Inline color styles will be preserved as they have higher specificity */
        }

        /* Font size preservation - ensure font sizes are maintained */
        .blog-content-container [style*="font-size"] {
          /* Inline font-size styles will be preserved */
        }

        /* Ensure all inline styles are preserved */
        .blog-content-container * {
          /* This ensures that any inline styles set by the editor are maintained */
        }
      `}</style>

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