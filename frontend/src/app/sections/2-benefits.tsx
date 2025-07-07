"use client";

import React from "react";
import { Inter, DM_Sans } from "next/font/google";
import { Clock, Target, FileText } from "lucide-react";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

export default function BenefitsSection() {
    const benefits = [
        {
            icon: Clock,
            title: "Save Time, Gain Focus",
            description: "Quickly discover the most pertinent legal cases with AITHENA's AI-powered search engine. Let our algorithm handle the research, so you can focus on crafting winning strategies."
        },
        {
            icon: Target,
            title: "Simplify Complexity",
            description: "AITHENA breaks complex case documents into digestible, accurate components, providing you with clear insights into key arguments, rulings and precedents."
        },
        {
            icon: FileText,
            title: "Stay Informed at a Glance",
            description: "AITHENA generates concise, easy-to-read summaries of lengthy cases. Get straight to the point and make informed decisions with ease."
        }
    ];

    return (
        <section className = "py-20 lg:py-28 bg-white relative">
            <div className = "max-w-8xl mx-auto px-10 sm:px-12 lg:px-14">
                <div className = "text-center mb-16">
                    <h2 className = {`${dmSans.className} text-4xl lg:text-5xl font-semibold text-slate-900 mb-6`}>
                        Why AITHENA?
                    </h2>
                    <p className = {`${inter.className} text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed`}>
                        Effortlessly streamline case research, gain clarity with detailed breakdowns, and stay informed through
                        concise summaries—all designed to save you time and enhance your productivity.
                    </p>
                </div>

                <div className = "grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                    {benefits.map((benefit, index) => (
                        <div key = {index} className = "text-center group">
                            <div className = "mb-8 flex justify-center">

                            </div>
                            <h3 className = {`${dmSans.className} text-4xl font-light mb-4 text-slate-900`}>
                                {benefit.title}
                            </h3>
                            <p className = {`${inter.className} text-slate-700 text-lg leading-relaxed max-w-[95%] mx-auto`}>
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};