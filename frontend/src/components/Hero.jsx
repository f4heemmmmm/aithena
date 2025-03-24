"use client";
import { Playfair_Display } from 'next/font/google';
import { Open_Sans } from 'next/font/google';
import { useCallback } from 'react';

// Initialize the font specifically for this component
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function Hero() {
    // Handle smooth scrolling to the learn-more section
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
    <div className="relative h-screen">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: "url('/images/main-background.jpg')",
          filter: "brightness(0.4)",
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 gap-6">
        <p className={`text-xl md:text-2xl text-white max-w-2xl font-light ${openSans.className}`}>
            Unlock Time, Live Your Prime
        </p>
        <h1 className={`text-4xl md:text-5xl lg:text-8xl font-extralight text-[#FCF9E2] tracking-tight mb-4 ${playfair.className}`}>
          Empowering Legal <br /> Professionals
        </h1>
        <button 
          onClick={scrollToLearnMore}
          className="mt-8 rounded-[5px] px-8 py-3 text-lg font-normal  transition duration-300 hover:bg-opacity-90 text-white border-white border cursor-pointer"
        >
          Discover More
        </button>
      </div>
    </div>
  );
}