"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Fonts
import { Playfair_Display } from "next/font/google";
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

import { Open_Sans } from "next/font/google";
const openSans = Open_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
});

// Use Case content
const useCases = [
    {
        id: 1,
        tab_title: "Case Lookup",
        title: "Accurate Lookups",
        image: "/images/use-case.png",
        description: `
            <p>Say goodbye to hours of manual searching. AITHENA's advanced AI engine scours vast databases to find the most relevant cases for you in seconds. Whether you're searching by keywords, case details, or legal precedents, AITHENA ensures you get the results that matter most, tailored to your needs.</p>
            <ul>
              <li>⚡ <strong>Advanced AI-Powered Search:</strong> Locate cases in seconds based on keywords, phrases, or legal concepts.</li>
              <li>✅ <strong>Relevant and Reliable Results:</strong> Eliminate irrelevant data and focus only on what helps your case.</li>
              <li>🚀 <strong>Streamlined Workflow:</strong> Spend less time searching and more time strategizing.</li>
            </ul>
        `,
    },
    {
        id: 2,
        tab_title: "Info Extraction",
        title: "Precision at your Fingertips",
        image: "/images/use-case2.png",
        description: `
            <p>AITHENA's NER feature extracts key entities from complex legal documents, allowing you to quickly identify the most relevant information and make data-driven decisions.</p>
            <ul>
              <li>🧠 <strong>Automated Entity Extraction:</strong> Identify names, organizations, dates, locations, and more in seconds.</li>
              <li>✅ <strong>Accuracy You Can Trust:</strong> AI-powered recognition ensures you don't miss critical details.</li>
              <li>⚖️ <strong>Legal-Specific Insights:</strong> Tailored for the legal industry, with focus on case-relevant entities.</li>
            </ul>
        `,
    },
    {
        id: 3,
        tab_title: "Summary",
        title: "Turn Complexity into Clarity",
        image: "/images/use-case3.png",
        description: `
            <p>Say goodbye to wading through long legal texts. AITHENA's AI-driven summarization extracts the most critical insights from lengthy cases, making it easier for you to focus on what matters.</p>
            <ul>
              <li>📝 <strong>Concise Case Summaries:</strong> Key takeaways and highlights from long documents in just seconds.</li>
              <li>🔍 <strong>Improve Comprehension:</strong> Understand complex cases faster with AI-powered clarity.</li>
              <li>🚀 <strong>Tailored for Legal Professionals:</strong> Get summaries tailored to your specific needs, whether for litigation, contracts, or compliance.</li>
            </ul>
        `,
    },
];

export default function Section4() {
    const containerRef = useRef(null);
    const [activeTab, setActiveTab] = useState(1);
    const [direction, setDirection] = useState(0);

    // Function: Set transition direction based on tab navigation
    const handleTabChange = (newTabID) => {
        if (newTabID === activeTab) {
            return;
        }
        setDirection(newTabID > activeTab ? 1 : -1);
        setActiveTab(newTabID);
    };

    // Function: Handle dragging of the tab content at the 2 ends\
    const handleDragAtEnd = (event, info) => {
        const swipeThreshold = 40;
        if (Math.abs(info.offset.x) > swipeThreshold) {
            const direction = info.offset.x > 0 ? -1 : 1;
            const nextTab = activeTab + direction;
            if (nextTab >= 1 && nextTab <= useCases.length) {
                handleTabChange(nextTab);
            }
        }
    };
    
    // Animation Variants for framer-motion library
    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0
        })
    };

    return (
        <section id = "section-4" className = "py-10 sm:py-16 md:py-20 bg-white border-t border-gray-100">
            <div className = "container mx-auto px-4 max-w-[1920px]">
                <div className = "flex flex-col items-center mb-8 sm:mb-12 md:md-16">
                    <h2 className = {`${playfair.className} text-gray-950 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-thin mb-3`}>
                        Use Cases
                    </h2>
                    <div className = "w-16 sm:w-20 md:w-24 h-1 bg-blue-500 rounded-full" />
                </div>
                {/* TAB CONTENT: USE CASES */}
                <div className = "flex justify-center mb-8 sm:mb-10 md:mb-12 overflow-x-auto max-w-full px-2">
                    <div className = "inline-flex rounded-[12px] shadow-lg p-1 sm:p-1.5 bg-gray-50 border border-gray-200">
                        {useCases.map((tab) => (
                            <button
                                key = {tab.id}
                                onClick = {() => handleTabChange(tab.id)}
                                aria-pressed = {activeTab === tab.id}
                                aria-controls = {`tab-panel-${tab.id}`}
                                id = {`tab-${tab.id}`}
                                className = {`
                                    relative px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-md transition-all duration-300 whitespace-nowrap
                                    ${openSans.className} text-xs sm:text-sm font-medium
                                    ${activeTab === tab.id 
                                        ? 'bg-blue-300/40 text-black shadow-sm' 
                                        : 'text-gray-700 hover:bg-gray-200'}
                                `}
                            >
                                {tab.tab_title}
                                {activeTab === tab.id && (
                                    <motion.span
                                        layoutId = "tabIndicator"
                                        className = "absolute bottom-1 left-0 right-0 mx-auto w-8 sm:w-10 md:w-12 h-0.5 bg-black rounded-full"
                                        initial = {false}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <div 
                    ref = {containerRef}
                    className = "bg-gray-50 rounded-[15px] overflow-hidden shadow-2xl relative mx-auto max-w-[98%] sm:max-w-[95%] md:max-w-[90%]"
                >
                    <AnimatePresence initial = {false} custom = {direction} mode = "wait">
                        <motion.div
                            key = {activeTab}
                            custom = {direction}
                            variants = {variants}
                            initial = "enter"
                            animate = "center"
                            exit = "exit"
                            drag = "x"
                            dragConstraints = {{ left: 0, right: 0 }}
                            dragElastic = {0.2}
                            onDragEnd = {handleDragAtEnd}
                            transition = {{ x: { type: "spring", stiffness: 500, damping: 30 }, opacity: { duration: 0.1 } }}
                            className = "w-full relative"
                        >
                            {useCases
                                .filter(useCase => useCase.id === activeTab)
                                .map(useCase => (
                                    <div key = {useCase.id} className = "flex flex-col md:flex-row">
                                        <div className = "w-full md:w-1/2 lg:w-3/5 relative">
                                            <div className = "h-64 sm:h-72 md:h-auto md:absolute md:inset-0">
                                                <Image
                                                    src = {useCase.image}
                                                    alt = {`${useCase.title} legal solutions`}
                                                    className = "w-full h-full object-cover"
                                                    fill = {true}
                                                    sizes = "(max-width: 768px) 100vw, 50vw"
                                                    priority
                                                />
                                                <div className = "absolute inset-0 bg-gradient-to-b from-black/60 to-transparent md:bg-gradient-to-l md:from-black/60 md:to-transparent" />
                                                <div className = "absolute top-4 left-4 md:hidden">
                                                    <span className = "bg-blue-500 text-black px-3 py-1 rounded text-xs font-medium">
                                                        {useCase.title}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className = "w-full md:w-1/2 lg:w-2/5 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                                            <h3 className = {`${playfair.className} text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-light mb-3 md:mb-4 text-gray-800`}>
                                                {useCase.title}
                                            </h3>
                                            <div className = "w-16 sm:w-20 md:w-24 h-1 bg-blue-500 mb-4 sm:mb-5 md:mb-6 rounded-full" />
                                            <div 
                                                className = {`${openSans.className} text-sm sm:text-base text-gray-900 leading-relaxed sm:leading-[1.8rem] md:leading-[2rem] description-content`}
                                                dangerouslySetInnerHTML = {{ __html: useCase.description }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className = "mt-6 sm:mt-8 md:mt-12 flex justify-center">
                    <div className = "flex space-x-2">
                        {useCases.map((tab) => (
                            <button
                                key = {tab.id}
                                onClick = {() => handleTabChange(tab.id)}
                                className = {`w-2 h-2 rounded-full transition-all duration-300 ${
                                    activeTab === tab.id ? 'bg-blue-500 w-4 sm:w-5 md:w-6' : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label = {`Switch to ${tab.title}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <style jsx global> 
                {`
                    .description-content ul {
                        margin-top: 0.75rem;
                        margin-bottom: 0.75rem;
                    }
                    .description-content li {
                        margin-bottom: 0.5rem;
                        list-style-type: none;
                        position: relative;
                        padding-left: 0.5rem;
                    }
                    .description-content strong {
                        color: #1e40af;
                        font-weight: 600;
                    }
                    .description-content p {
                        margin-bottom: 0.75rem;
                    } 
                    @media (min-width: 640px) {
                        .description-content ul {
                            margin-top: 1rem;
                            margin-bottom: 1rem;
                        }
                        .description-content li {
                            margin-bottom: 0.75rem;
                        }
                        .description-content p {
                            margin-bottom: 1rem;
                        }
                    }
                `}
            </style>
        </section>
    );
};