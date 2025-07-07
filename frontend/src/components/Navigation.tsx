"use client";

import { useState, useEffect, useRef } from 'react';
import { Menu, X, Linkedin, LogIn, LogOut, User } from 'lucide-react';
import LoginModal from './LoginModal';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: "Home", href: "/" },
  { name: "The Team", href: "/team" },
  { name: "About Us", href: "/about" },
  { name: "Newsroom", href: "/newsroom" },
  { name: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const { isAuthenticated, admin, logout, loading } = useAuth();
  const headerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);

      if (scrollDifference < scrollThreshold) return;

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }

      if (currentScrollY <= 0) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    // Set current path for active navigation highlighting
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    const updateNavHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--nav-height', `${height}px`);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      // Redirect to login page instead of opening modal
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 px-8 h-30 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="w-10 h-10 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <div 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 bg-gray-900 px-8 h-30 flex items-center justify-between transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-white hover:bg-gray-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-10 w-10" />
            ) : (
              <Menu className="h-10 w-10" />
            )}
          </button>
          <div className="flex items-center space-x-2">
            <a href="/" className="text-4xl font-light text-white hover:text-gray-300 transition-colors">
              AITHENA
            </a>
          </div>
        </div>

        {/* Admin info for desktop - keeping login button minimal in header */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <div className="hidden md:flex items-center text-white">
              <span className="text-sm">
                {admin?.first_name} {admin?.last_name}
              </span>
            </div>
          )}
          <button
            onClick={handleAuthClick}
            className="px-3 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors"
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`fixed inset-y-0 left-0 z-50 w-90 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900"
          aria-label="Close menu"
        >
          <X className="h-12 w-12" />
        </button>

        <nav className="flex flex-col h-full pt-24">
          <div className="flex-1 px-8 py-4 overflow-y-auto">
            <ul className="space-y-0">
              {navigation.map((item, index) => {
                const isActive = currentPath === item.href;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-3 text-4xl transition-colors ${
                        isActive 
                          ? "text-blue-600 hover:text-blue-700 font-medium" 
                          : "text-gray-900 hover:text-gray-600 font-light"
                      }`}
                    >
                      {item.name}
                    </a>
                  </li>
                );
              })}
              
              {/* LinkedIn button after Contact */}
              <li>
                <a
                  href="https://www.linkedin.com/company/aithena-sg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-4xl font-light text-gray-900 hover:text-gray-600 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              
              {isAuthenticated && (
                <li>
                  <a
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-3 text-4xl transition-colors ${
                      currentPath === '/admin'
                        ? "text-blue-600 hover:text-blue-700 font-medium"
                        : "text-blue-600 hover:text-blue-700 font-light"
                    }`}
                  >
                    Admin Dashboard
                  </a>
                </li>
              )}
            </ul>

            {/* User info section - only show when authenticated */}
            {isAuthenticated && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {admin?.first_name} {admin?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom section with login button */}
          <div className="flex-shrink-0 px-8 py-6 border-t border-gray-200">
            <div className="flex items-center justify-start">
              {/* Login/Logout button moved to bottom left */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleAuthClick();
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isAuthenticated 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {isAuthenticated ? 'Logout' : 'Login'}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}