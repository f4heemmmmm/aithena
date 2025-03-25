"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

export default function NavigationBar() {
    const [atTop, setAtTop] = useState(true);
    const [hidden, setHidden] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        let lastScrollY = 0;
        let ticking = false;

        const updateScrollVisibility = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                setHidden(true);
            } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
                setHidden(false);
            }
            setAtTop(currentScrollY < 50);
            lastScrollY = currentScrollY;
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollVisibility);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    const scrollToSection2 = useCallback((e) => {
        e.preventDefault();
        const section2 = document.getElementById("section-2");
        if (section2) {
            section2.scrollIntoView({ behavior: "smooth", block: "start" });
            setIsMenuOpen(false);
        }
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <motion.nav
            initial = {{ y: 0, opacity: 1 }}
            animate = {{ y: hidden ? "-100%" : 0, opacity: hidden ? 0 : 1 }}
            transition = {{ duration: 0.4, ease: "easeInOut" }}
            className = {`
                fixed top-0 left-0 right-0 z-50 
                ${atTop ? "bg-[#101921]" : "bg-[#101921]/90 backdrop-blur-md"}
                shadow-lg py-4 md:py-6
            `}
        >
            <div className = "container mx-auto px-4">
                <div className = "flex justify-between items-center">
                    <div className = "flex items-center">
                        <p className = {`${openSans.className} text-LG md:text-2xl font-medium text-white`}>
                            Athena
                        </p>
                    </div>
                    {/* HAMBURGER MENU FOR MOBILE */}
                    <button 
                        onClick = {toggleMenu}
                        className = "md:hidden text-white p-2 z-60 relative"
                        aria-label = "Toggle menu"
                    >
                        <div className = "w-6 h-4 relative flex flex-col justify-between">
                            <motion.span 
                                animate = {{ 
                                    rotate: isMenuOpen ? 45 : 0,
                                    y: isMenuOpen ? 6 : 0
                                }}
                                className = {`
                                    absolute left-0 w-full h-0.5 bg-white 
                                    origin-left transition-all duration-300
                                `} 
                            />
                            <motion.span 
                                animate = {{ 
                                    opacity: isMenuOpen ? 0 : 1,
                                    scale: isMenuOpen ? 0 : 1
                                }}
                                className = "absolute left-0 top-1/2 w-full h-0.5 bg-white" 
                            />
                            <motion.span 
                                animate = {{ 
                                    rotate: isMenuOpen ? -45 : 0,
                                    y: isMenuOpen ? -6 : 0
                                }}
                                className = {`
                                    absolute left-0 bottom-0 w-full h-0.5 bg-white 
                                    origin-left transition-all duration-300
                                `} 
                            />
                        </div>
                    </button>

                    {/* Desktop Navigation */}
                    <div className = "hidden md:flex items-center space-x-8 gap-3">
                        <button
                            onClick = {scrollToSection2}
                            className = {`
                                ${openSans.className} 
                                relative group py-2 text-white text-lg font-medium 
                                transition-colors cursor-pointer hover:text-blue-400
                            `}
                        >
                            About
                            <span className = "absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                        </button>
                    </div>
                    {/* MOBILE VIEW */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial = {{ opacity: 0 }}
                                animate = {{ opacity: 1 }}
                                exit = {{ opacity: 0 }}
                                className = "md:hidden fixed inset-0 bg-[#101921] z-50 flex flex-col items-center justify-center"
                            >
                                <motion.div
                                    initial = {{ y: 50, opacity: 0 }}
                                    animate = {{ y: 0, opacity: 1 }}
                                    transition = {{ delay: 0.2 }}
                                    className = "space-y-6 text-center"
                                >
                                    <button
                                        onClick = {scrollToSection2}
                                        className = {`
                                            ${openSans.className} 
                                            block text-white text-2xl font-semibold 
                                            hover:text-blue-400 transition-colors
                                        `}
                                    >
                                        About
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.nav>
    );
};