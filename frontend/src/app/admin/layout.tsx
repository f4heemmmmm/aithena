"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdministratorLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
};