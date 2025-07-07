"use client";

import React from "react";
import { Inter, DM_Sans } from "next/font/google";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

export default function MainSection() {
    return (
        <section id = "main-section" className = "relative bg-gray-900 text-white py-20 sm:py-32 lg:py-40 overflow-hidden">
            <div className = "absolute inset-0 opacity-10">
                <div
                    className = "absolute inset-0"
                    style = {{ backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 0)` }}
                />
            </div>

            <div className = "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className = "text-center space-y-8">
                    <div className = "inline-block px-6 py-3 mb-5">
                        <p className = {`${dmSans.className} text-blue-100 font-light text-4xl`}>
                            Unlock Time, Live Your Prime
                        </p>
                    </div>
                    <div className = "space-y-6">
                        <h1 className = {`${dmSans.className} text-6xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-tight text-white`}>
                            Simplifying Legal Work with <br />
                            <span className = "text-transparent bg-gradient-to-r from-blue-300 to-blue-600 bg-clip-text">
                                AI-Powered Efficiency
                            </span>
                        </h1>
                    </div>
                </div>
            </div>
            <div className = "absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
            <div className = "absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl" />
        </section>
    );
};