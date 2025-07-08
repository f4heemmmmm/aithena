// src/app/newsroom/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Search, Eye } from 'lucide-react';
import { Inter, DM_Sans } from "next/font/google";
import { blogService, BlogPost } from '@/services/blogService';
import NoArticles from '@/components/NoArticles';
const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

export default function NewsroomPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    // Filter posts based on search term
    if (searchTerm.trim() === '') {
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

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch all published posts
      const publishedPosts = await blogService.getPublishedPosts();
      setPosts(publishedPosts);
      setFilteredPosts(publishedPosts);
      
      // Fetch featured posts
      const featured = await blogService.getFeaturedPosts();
      setFeaturedPosts(featured.slice(0, 2)); // Show top 2 featured posts
      
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Helper function to get the main image (uploaded or featured)
  const getMainImage = (post: BlogPost): string => {
    return blogService.getMainImage(post) || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  };

  // Helper function to get image alt text
  const getImageAlt = (post: BlogPost): string => {
    return blogService.getImageAlt(post);
  };

  const renderLoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-pulse">
          {/* Featured Posts Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className={`bg-gray-300 ${index === 0 ? "h-64" : "h-48"}`} />
                <div className={`p-6 ${index === 0 ? "md:p-8" : ""}`}>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-3" />
                  <div className={`bg-gray-300 rounded w-3/4 mb-3 ${
                    index === 0 ? "h-8" : "h-6"
                  }`} />
                  <div className="h-4 bg-gray-300 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-4" />
                  <div className="h-4 bg-gray-300 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderArticlesGrid = () => {
    const displayPosts = searchTerm === '' && featuredPosts.length > 0 
      ? [...featuredPosts, ...filteredPosts.filter(post => !featuredPosts.some(fp => fp.id === post.id))]
      : filteredPosts;

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
      <div className={`${getGridClasses()} min-h-[400px]`}>
        {displayPosts.map((post, index) => {
          const shouldBeMainCard = displayPosts.length >= 3 && index === 0 && searchTerm === '';
          const isFeatured = featuredPosts.some(fp => fp.id === post.id) && searchTerm === '';
          
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer block ${
                shouldBeMainCard ? "md:col-span-2 md:row-span-2" : ""
              } ${displayPosts.length === 1 ? "max-w-md" : ""}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={getMainImage(post)}
                  alt={getImageAlt(post)}
                  className={`w-full object-cover transition-transform duration-300 hover:scale-105 ${
                    shouldBeMainCard ? "h-64" : "h-48"
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {isFeatured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                )}
              </div>
              
              <div className={`p-6 ${shouldBeMainCard ? "md:p-8" : ""}`}>
                <div className={`${inter.className} flex items-center font-sm text-base text-gray-400 mb-3`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {blogService.formatDate(post.published_at || post.created_at)}
                  </span>
                  <span className="mx-2 font-light"> | </span>
                  <User className="h-4 w-4 mr-2" />
                  <span>
                    {blogService.getAuthorName(post)}
                  </span>
                  <span className="mx-2 font-light hidden sm:inline"> | </span>
                  <Eye className="h-4 w-4 mr-2 hidden sm:inline" />
                  <span className="hidden sm:inline">
                    {blogService.formatViewCount(post.view_count)} views
                  </span>
                </div>

                <h3 className={`${dmSans.className} font-thin text-gray-900 mb-3 line-clamp-2 ${
                  shouldBeMainCard ? "text-5xl md:text-7xl" : "text-3xl"
                }`}>
                  {post.title}
                </h3>

                <p className={`${inter.className} text-gray-600 mb-4 font-light line-clamp-3 leading-relaxed ${
                  shouldBeMainCard ? "text-xl" : "text-lg"
                }`}>
                  {(() => {
                    const excerpt = blogService.getExcerpt(post, shouldBeMainCard ? 200 : 120);
                    const firstSentence = excerpt.split('.')[0];
                    return firstSentence.length < excerpt.length ? `${firstSentence}...` : excerpt;
                  })()}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className={`${inter.className} inline-flex items-center text-blue-600 hover:text-blue-700 font-2xl transition-colors group`}>
                    Read more
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                  {!shouldBeMainCard && (
                    <div className={`${inter.className} text-sm text-gray-500`}>
                      {blogService.formatReadingTime(post.content)}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return renderLoadingSkeleton();
  }

  const hasRealPosts = featuredPosts.length > 0 || posts.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className={`${dmSans.className} text-6xl font-semibold text-gray-900 mb-4`}>Newsroom</h1>
            <p className={`${inter.className} text-xl text-gray-600 max-w-3xl mx-auto`}>
              Stay updated with the latest news, insights, and developments from AITHENA.
            </p>
          </div>

          {/* Search Bar - Only show if there are posts */}
          {hasRealPosts && (
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`${inter.className} w-full pl-10 pr-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:ring-2  focus:border-transparent`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && searchTerm === '' && (
          <div className="mb-16">
            <h2 className={`${dmSans.className} text-2xl font-bold text-gray-900 mb-8`}>Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer block"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getMainImage(post)}
                      alt={getImageAlt(post)}
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className={`${inter.className} flex items-center font-sm text-base text-gray-400 mb-3`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {blogService.formatDate(post.published_at || post.created_at)}
                      </span>
                      <span className="mx-2 font-light"> | </span>
                      <User className="h-4 w-4 mr-2" />
                      <span>
                        {blogService.getAuthorName(post)}
                      </span>
                    </div>
                    
                    <h3 className={`${dmSans.className} font-thin text-gray-900 mb-3 line-clamp-2 text-2xl`}>
                      {post.title}
                    </h3>
                    
                    <p className={`${inter.className} text-gray-600 mb-4 font-light line-clamp-3 leading-relaxed text-lg`}>
                      {(() => {
                        const excerpt = blogService.getExcerpt(post, 200);
                        const firstSentence = excerpt.split('.')[0];
                        return firstSentence.length < excerpt.length ? `${firstSentence}...` : excerpt;
                      })()}
                    </p>
                    
                    <div className={`${inter.className} inline-flex items-center text-blue-600 hover:text-blue-700 font-2xl transition-colors group`}>
                      Read more
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Posts Section - Only show if there are posts */}
        {hasRealPosts && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className={`${dmSans.className} text-2xl font-bold text-gray-900`}>
                {searchTerm ? `Search Results (${filteredPosts.length})` : 'All Articles'}
              </h2>
              {!searchTerm && (
                <div className={`${inter.className} text-sm text-gray-500`}>
                  {posts.length} article{posts.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content - Show articles if they exist, otherwise show no articles message */}
        {!hasRealPosts ? (
          <NoArticles />
        ) : (
          filteredPosts.length === 0 ? (
            <NoArticles 
              searchTerm={searchTerm}
              onClearSearch={handleClearSearch}
              variant="search"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer block"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={getMainImage(post)}
                      alt={getImageAlt(post)}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {post.is_featured && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className={`${inter.className} flex items-center font-sm text-base text-gray-400 mb-3`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {blogService.formatDate(post.published_at || post.created_at)}
                      </span>
                      <span className="mx-2 font-light"> | </span>
                      <User className="h-4 w-4 mr-2" />
                      <span>
                        {blogService.getAuthorName(post)}
                      </span>
                      <span className="mx-2 font-light hidden sm:inline"> | </span>
                      <Eye className="h-4 w-4 mr-2 hidden sm:inline" />
                      <span className="hidden sm:inline">
                        {blogService.formatViewCount(post.view_count)} views
                      </span>
                    </div>
                    
                    <h3 className={`${dmSans.className} font-thin text-gray-900 mb-3 line-clamp-2 text-2xl`}>
                      {post.title}
                    </h3>
                    
                    <p className={`${inter.className} text-gray-600 mb-4 font-light line-clamp-3 leading-relaxed text-lg`}>
                      {(() => {
                        const excerpt = blogService.getExcerpt(post, 180);
                        const firstSentence = excerpt.split('.')[0];
                        return firstSentence.length < excerpt.length ? `${firstSentence}...` : excerpt;
                      })()}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className={`${inter.className} inline-flex items-center text-blue-600 hover:text-blue-700 font-2xl transition-colors group`}>
                        Read more
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </div>
                      <div className={`${inter.className} text-sm text-gray-500`}>
                        {blogService.formatReadingTime(post.content)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}