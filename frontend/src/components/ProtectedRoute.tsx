"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({children}: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className = "min-h-screen bg-gray-100 flex items-center justify-center">
                <div className = "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {children}
        </>
    );
};