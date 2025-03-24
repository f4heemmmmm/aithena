"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';
import { Open_Sans } from 'next/font/google';

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

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <motion.div 
      className="flex flex-col items-start w-full md:w-1/3 px-6 mb-12 md:mb-0 transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className=" p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className={`text-3xl font-thin text-[#ffffff] text-left mb-4 ${playfair.className}`}>{title}</h3>
      <p className={`text-[#FCF9E2] text-left font-medium leading-[1.7rem] opacity-80 ${openSans.className}`}>
        {description}
      </p>
    </motion.div>
  );
};

export default function Section2() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, []);
  
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#A8DADC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: "Save Time, Gain Focus",
      description: "Quickly discover the most pertinent legal cases with AITHENA's AI-powered search engine. Let our algorithms handle the research, so you can focus on crafting winning strategies."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#A8DADC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Simplify Complexity",
      description: "AITHENA breaks complex case documents into digestible, accurate components, providing you with clear insights into key arguments, rulings, and precedents."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#A8DADC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Stay Informed at a Glance",
      description: "AITHENA generates concise, easy-to-read summaries of lengthy cases. Get straight to the point and make informed decisions with ease."
    }
  ];
  
  const partners = [1, 2, 3, 4];

  return (
    <section id="section-2" className="py-16 min-h-screen bg-[#101921]">
      <div className="container mx-auto px-4 flex flex-col gap-2">
        <motion.div 
          className="mb-16 flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className={`text-4xl md:text-6xl text-[#ffffff] mb-4 text-left font-thin ${playfair.className}`}
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Simplifying Legal Work <br /> with AI-Powered Efficiency
          </motion.h2>
          <motion.p 
            className={`text-lg text-[#FCF9E2] max-w-3xl mx-auto text-right font-medium leading-[2.2rem] mb-12 ${openSans.className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Effortlessly streamline case research, gain clarity with detailed breakdowns, and stay informed through concise summaries—all designed to save you time and enhance your productivity.
          </motion.p>
        </motion.div>
        
        {/* Features displayed side by side with vertical separators */}
        <div className="flex flex-col md:flex-row justify-center items-stretch">
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <FeatureCard 
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.3 + index * 0.2}
              />
              {/* Vertical separator between features - only visible on md and larger screens */}
              {index < features.length - 1 && (
                <div className="hidden md:block h-auto self-stretch w-px bg-gradient-to-b from-transparent via-[#A8DADC] to-transparent opacity-40 mx-4"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}