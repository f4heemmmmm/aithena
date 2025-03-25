"use client";

import { useCallback } from "react";

// Font
import { Open_Sans } from "next/font/google";
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

import { Playfair_Display } from "next/font/google";
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export default function Section1() {
    const scrollToSection2 = useCallback((e) => {
        e.preventDefault();
        const section2 = document.getElementById("section-2");
        if (section2) {
            section2.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    return (
        <div className = "relative h-screen">
            {/* BACKGROUND IMAGE */}
            <div
                className = "absolute inset-0 bg-cover bg-center z-0"
                style = {{ backgroundImage: "url('/images/main-background.jpg')", filter: "brightness(0.4)" }}
            />
            {/* OVERLAY TEXT */}
            <div className = "relative z-10 h-full flex flex-col justify-center items-center text-center px-4 gap-6">
                <p className = {`${openSans.className} text-xl md:text-2xl text-white max-w-2xl font-light`}>
                    Unlock Time, Live Your Prime
                </p>
                <h1 className = {`${playfair.className} md:text-5xl text-6xl lg:text-8xl font-extralight text-[#FCF9E2] tracking-tight mb-4`}>
                    Empowering Legal <br /> Professionals
                </h1>
                <button
                    onClick = {scrollToSection2}
                    className = "mt-6 rounded-[8px] px-6 py-2.5 text-base font-normal transition duration-300 hover:bg-opacity-90 text-white border-white border cursor-pointer"
                >
                    Discover More
                </button>
            </div>
        </div>
    );
};