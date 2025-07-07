"use client";

import { Inter, DM_Sans } from "next/font/google";
import { Linkedin, Mail, MapPin, ArrowRight } from "lucide-react";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export default function Footer() {
    return (
        <footer className = "bg-gray-900 text-white">
            <div className = "max-w-7xl mx-auto px-6 py-12">
                <div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className = "lg:col-span-1">
                        <h3 className = {`${dmSans.className} text-lg font-semibold mb-4`}>
                            AITHENA
                        </h3>
                        <p className = {`${inter.className} text-gray-200 text-base leading-relaxed mb-4`}>
                            AI-powered legal research for professionals
                        </p>
                        <div className = "flex items-center space-x-4">
                            <a
                                href = "https://www.linkedin.com/company/aithena-sg/"
                                target = "_blank"
                                rel = "noopener noreferrer"
                                className = "text-gray-400 hover:text-white transition-colors duration-200"
                                aria-label = "LinkedIn"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a
                                href = "mailto:hello@aithena.sg"
                                className = "text-gray-400 hover:text-white transition-colors duration-200"
                                aria-label = "Email"
                            >
                                <Mail className = "h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h4 className = {`${dmSans.className} text-lg font-medium uppercase tracking-wider mb-4 text-gray-200`}>
                            Company
                        </h4>
                        <nav className = "space-y-2">
                            <a href="/about" className = {`${inter.className} block text-base text-gray-200 hover:text-white transition-colors duration-200`}>
                                About Us
                            </a>
                            <a href = "/team" className = {`${inter.className} block text-base text-gray-200 hover:text-white transition-colors duration-200`}>
                                Team
                            </a>
                            <a href = "/newsroom" className = {`${inter.className} block text-base text-gray-200 hover:text-white transition-colors duration-200`}>
                                Newsroom
                            </a>
                            <a href = "/contact" className = {`${inter.className} block text-base text-gray-200 hover:text-white transition-colors duration-200`}>
                                Contact
                            </a>
                        </nav>
                    </div>

                    {/* RESOURCES */}
                    <div>
                        <h4 className = {`${dmSans.className} text-lg  font-medium uppercase tracking-wider mb-4 text-gray-200`}>
                            Resources
                        </h4>
                        <nav className = "space-y-2">
                            <a href="/newsletter" className = {`${inter.className} block text-base text-gray-200 hover:text-white transition-colors duration-200`}>
                                Newsletter
                            </a>
                            <a href = "/privacy" className = {`${inter.className} block text-base text-gray-200 hover:text-white transition-colors duration-200`}>
                                Privacy Policy
                            </a>
                            <a href = "/terms" className = {`${inter.className} block text-base text-gray-200 hover:text-white transition-colors duration-200`}>
                                Terms of Service
                            </a>
                        </nav>
                    </div>

                    {/* CONTACT INFORMATION */}
                    <div>
                        <h4 className = {`${dmSans.className} text-lg font-medium uppercase tracking-wider mb-4 text-gray-200`}>
                            Singapore
                        </h4>
                        <div className = "space-y-2 text-base text-gray-200">
                            <p className = {`${dmSans.className} font-medium text-white`}>
                                AITHENA PTE. LTD.
                            </p>
                            <p className = {`${inter.className} leading-relaxed`}>
                                160 Robinson Road, #14-04<br />
                                Singapore Business Federation Center<br />
                                Singapore 068914
                            </p>
                            <a 
                                href = "mailto:hello@aithena.sg" 
                                className = {`${inter.className} inline-block hover:text-white transition-colors duration-200 mt-2`}
                            >
                                hello@aithena.sg
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};