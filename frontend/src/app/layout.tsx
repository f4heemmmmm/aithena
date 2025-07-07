"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({children}: { children: React.ReactNode; }) {
    const pathName = usePathname();
    const hideFooter = pathName === "/login";
    return (
        <html lang = "en">
            <body className = {inter.className}>
                <AuthProvider>
                    <Navigation />
                    <main>
                        {children}
                    </main>
                    {!hideFooter && <Footer />}
                </AuthProvider>
            </body>
        </html>
    );
};