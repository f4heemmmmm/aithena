"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Administrator {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    administrator: Administrator | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; data?: any }>;
    logout: () => void;
    loading: boolean;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [administrator, setAdministrator] = useState<Administrator | null>(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            if (token) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setAdministrator(result.data.user);
                    setIsAuthenticated(true);
                } else {
                    // Token is invalid
                    localStorage.removeItem("adminToken");
                    localStorage.removeItem("adminData");
                }
            }
        } catch (error) {
            console.error("Authentication check failed", error);
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminData");
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("adminToken", data.data.access_token);
                localStorage.setItem("adminData", JSON.stringify(data.data.administrator));
                setAdministrator(data.data.administrator);
                setIsAuthenticated(true);
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.message || "Login failed!" };
            }
        } catch (error) {
            return { success: false, error: "Network error. Please try again." };
        }
    };

    const logout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        setAdministrator(null);
        setIsAuthenticated(false);
    };

    const value = {
        isAuthenticated,
        administrator,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value = {value}>
            {children}
        </AuthContext.Provider>
    );
};