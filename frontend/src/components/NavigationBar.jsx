"use client";

import { useState } from "react";
import { useCallback } from "react";
import { motion, useScroll, useMotionValueEvent, easeInOut } from "framer-motion";

// Font
import { Open_Sans } from "next/font/google";
const openSans = Open_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

export default function NavigationBar() {
    const { scrollY } = useScroll();
    const [atTop, setAtTop] = useState(true);
    const [hidden, setHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setAtTop(latest < 50);
    });

    const scrollToSection2 = useCallback((e) => {
        e.preventDefault();
        const section2 = document.getElementById("section-2");
        if (section2) {
            section2.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    return (
        <motion.nav
            variants = {{
                visible: { y: 0, opacity: 1 },
                hidden: { y: "-100%", opacity: 0 },
            }}
            animate = {hidden ? "hidden" : "visible"}
            transition = {{ duration: 0.35, ease: easeInOut}}
            className = {`fixed top-0 left-0 right-0 z-50 transition-all duration-300  ${
                atTop ? "bg-[#101921]" : "bg-[#101921]/90 backdrop-blur-md"
            } shadow-lg py-6`}
        >
            <div className = "container mx-auto px-4">
                <div className = "flex justify-between items-center h-15">
                    {/* LEFT NAVBAR: COMPANY NAME */}
                    <div className = "flex items-center">
                        <span className = {`${openSans.className} text-2xl font-semibold text-white`}>
                            Athena
                        </span>
                    </div>
                    {/* RIGHT NAVBAR: BUTTON AND LINKS */}
                    <div className = "flex items-center space-x-8 gap-3">
                        <button
                            onClick = {scrollToSection2}
                            className = {`${openSans.className} relative group py-2 text-white text-lg font-medium transition-colors cursor-pointer`}
                        >
                            About
                            <span className = "absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};