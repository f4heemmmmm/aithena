import LoginModal from "./LoginModal";
import { X, Menu, User, Home, Users, Info, Newspaper, Mail, ExternalLink, Settings, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "The Team", href: "/team", icon: Users },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Newsroom", href: "/newsroom", icon: Newspaper },
    { name: "Contact", href: "/contact", icon: Mail },
];

export default function Navigation() {
    const [currentPath, setCurrentPath] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { isAuthenticated, administrator, logout, loading } = useAuth();

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    const handleAuthClick = () => {
        if (isAuthenticated) {
            logout();
        } else {
            window.location.href = "/login";
        }
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const openSidebar = () => {
        setIsSidebarOpen(true);
    };

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSidebarOpen && event.target instanceof Element && !event.target.closest('.sidebar-container')) {
                closeSidebar();
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    if (loading) {
        return (
            <div className="fixed top-0 left-0 z-50 h-full min-h-screen w-16 bg-gray-950">
                <div className="flex flex-col h-full">
                    <div className="p-3">
                        <div className="w-10 h-10 bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
            {/* COLLAPSED SIDEBAR */}
            <div className={`fixed top-0 left-0 z-40 h-full min-h-screen bg-gray-950 border-r border-gray-800 transition-all duration-300 ease-in-out ${
                isSidebarOpen ? "w-0 opacity-0" : "w-16 opacity-100"
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo/Menu Icon */}
                    <div className="p-3 border-b border-gray-800">
                        <button
                            onClick={openSidebar}
                            className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                            aria-label="Open sidebar"
                            aria-expanded="false"
                            role="button"
                        >
                            <Menu className="h-4 w-4 text-white" />
                        </button>
                    </div>

                    {/* Navigation Icons */}
                    <div className="flex-1 py-3">
                        <div className="space-y-1 px-3">
                            {navigation.map((item) => {
                                const isActive = currentPath === item.href;
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                                            isActive
                                                ? "bg-gray-800 text-white"
                                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        }`}
                                        title={item.name}
                                        aria-label={`Navigate to ${item.name}`}
                                        role="link"
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="p-3 border-t border-gray-800">
                        <button
                            onClick={handleAuthClick}
                            className={`w-10 h-10 rounded-lg transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                                isAuthenticated
                                    ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            title={isAuthenticated ? "Log Out" : "Login"}
                            aria-label={isAuthenticated ? "Log out of account" : "Log into account"}
                            role="button"
                        >
                            <User className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* EXPANDED SIDEBAR */}
            <div className={`fixed top-0 left-0 z-50 h-full min-h-screen sidebar-container transition-all duration-300 ease-in-out ${
                isSidebarOpen ? "w-80" : "w-0"
            }`}>
                <div className={`h-full min-h-screen bg-gray-950 border-r border-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "w-80" : "w-0"
                }`}>
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                           
                            <span className="text-white font-medium">AITHENA</span>
                        </div>
                        <button
                            onClick={closeSidebar}
                            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                            aria-label="Close sidebar"
                            aria-expanded="true"
                            role="button"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex flex-col h-full">
                        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                            {navigation.map((item) => {
                                const isActive = currentPath === item.href;
                                const Icon = item.icon;
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        onClick={closeSidebar}
                                        className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                                            isActive
                                                ? "bg-gray-800 text-white"
                                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                        }`}
                                        aria-current={isActive ? "page" : undefined}
                                        role="link"
                                    >
                                        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                                        <span className="truncate">{item.name}</span>
                                    </a>
                                );
                            })}

                            {/* LinkedIn Link */}
                            <a
                                href="https://www.linkedin.com/company/aithena-sg/"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={closeSidebar}
                                className="flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                                aria-label="Open LinkedIn page in new tab"
                                role="link"
                            >
                                <ExternalLink className="h-4 w-4 mr-3 flex-shrink-0" />
                                <span className="truncate">LinkedIn</span>
                            </a>

                            {/* Admin Dashboard (if authenticated) */}
                            {isAuthenticated && (
                                <a
                                    href="/admin"
                                    onClick={closeSidebar}
                                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                                        currentPath === "/admin"
                                            ? "bg-gray-800 text-white"
                                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                                    aria-current={currentPath === "/admin" ? "page" : undefined}
                                    role="link"
                                >
                                    <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                                    <span className="truncate">Administrator Dashboard</span>
                                </a>
                            )}
                        </nav>

                        {/* Bottom Auth Section */}
                        <div className="p-3 border-t border-gray-800 flex-shrink-0">
                            <button
                                onClick={() => {
                                    closeSidebar();
                                    handleAuthClick();
                                }}
                                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                                    isAuthenticated
                                        ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        : "text-white bg-blue-600 hover:bg-blue-700"
                                }`}
                                aria-label={isAuthenticated ? "Log out of account" : "Log into account"}
                                role="button"
                            >
                                <User className="h-4 w-4 mr-3 flex-shrink-0" />
                                <span className="truncate">{isAuthenticated ? "Log Out" : "Login"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    );
}