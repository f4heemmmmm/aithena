"use client";

import Link from "next/link";
import React, { JSX } from "react";
import { ArrowRight } from "lucide-react";

export default function ContactSection() {
    return (
        <section id = "contact-section" className = "bg-gradient-to-br from-gray-50 to-gray-200 py-20 lg:py-28">
            <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className = "flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                    <div className = "lg:w-1/2 text-center lg:text-left">
                        <div className = "inline-block mb-4">
                            <p className = "text-sm font-semibold text-gray-500 tracking-widest uppercase">
                                Heard Enough?
                            </p>
                        </div>
                        <h2 className = "text-7xl lg:text-8xl font-light italic text-blue-950 leading-tight mb-6 tracking-tight">
                            Contact Us
                        </h2>
                        <p className = "text-base text-gray-600 max-w-lg leading-relaxed">
                            Got a question, idea, or just want to say hello? We'd love to hear from you.
                            Send us a message and we'll be in touch real soon!
                        </p>
                    </div>

                    <div className = "lg:w-1/2 flex justify-center lg:justify-end">
                        <Link href = "/contact" className = "group">
                            <button className = "relative bg-blue-300 hover:bg-blue-500 text-white rounded-full w-28 h-28 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50">
                                <ArrowRight className = "h-12 w-12 transition-transform duration-300 group-hover:translate-x-1 font-extralight" />
                                <div className = "absolute inset-0 rounded-full bg-yellow-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                            </button>
                        </Link> 
                    </div>
                </div>
            </div>
        </section>
    );
};