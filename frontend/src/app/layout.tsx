import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AITHENA",
    description: "Advanced AI technology for legal professionals"
};

export default function RootLayout({children}: { children: React.ReactNode; }) {
    return (
        <html lang = "en">
            <body className = {inter.className}>
                <AuthProvider>
                    <Navigation />
                    <main>
                        {children}
                    </main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
};