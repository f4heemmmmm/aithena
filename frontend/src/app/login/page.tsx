// src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const fillDemoCredentials = () => {
    setEmail('admin@aithena.com');
    setPassword('Admin123!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        

        {/* Header */}
        <div className="text-center">
          <h1 className="text-7xl font-light text-gray-900 mb-2">
            AITHENA
          </h1>
          <p className="text-sm text-gray-600 font-semibold">
            For Administrators Only
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-gray-800 transition-all duration-200 text-gray-900"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-0 py-3 pr-12 border-0 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-gray-800 transition-all duration-200 text-gray-900"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-all duration-300 transform hover:scale-110"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <div className="relative w-5 h-5">
                    <Eye 
                      className={`absolute w-5 h-5 transition-all duration-300 ease-in-out transform ${
                        showPassword 
                          ? 'opacity-0 scale-75 rotate-12' 
                          : 'opacity-100 scale-100 rotate-0'
                      }`} 
                    />
                    <EyeOff 
                      className={`absolute w-5 h-5 transition-all duration-300 ease-in-out transform ${
                        showPassword 
                          ? 'opacity-100 scale-100 rotate-0' 
                          : 'opacity-0 scale-75 -rotate-12'
                      }`} 
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Demo Credentials</p>
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p><span className="font-medium">Email:</span> admin@aithena.com</p>
                <p><span className="font-medium">Password:</span> Admin123!</p>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-sm text-gray-800 hover:text-gray-600 underline transition-colors duration-200"
              >
                Fill demo credentials
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}