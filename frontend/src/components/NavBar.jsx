"use client";
import Link from 'next/link';
import { Open_Sans } from 'next/font/google';
import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useCallback } from 'react';

const openSans = Open_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
});

export default function Navbar() {
    const [hidden, setHidden] = useState(false);
    const [atTop, setAtTop] = useState(true);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setAtTop(latest < 50);
    });

    const scrollToLearnMore = useCallback((e) => {
        e.preventDefault();
        const learnMoreSection = document.getElementById('learn-more');
        if (learnMoreSection) {
          learnMoreSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, []);

    return (
        <motion.nav
            variants={{
                visible: { y: 0, opacity: 1 },
                hidden: { y: "-100%", opacity: 0 },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                atTop ? 'bg-[#101921]' : 'bg-[#101921]/95 backdrop-blur-md'
            } shadow-md py-6`}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-12">
                    <div className="flex items-center">
                        <span className={`${openSans.className} text-3xl font-bold text-white`}>AITHENA</span>
                    </div>
                    
                    <div className="flex items-center space-x-8 gap-3">
                        <button
                            onClick={scrollToLearnMore}
                            className={`${openSans.className} relative group py-2 text-white text-lg font-medium transition-colors cursor-pointer`}
                        >
                            About
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}