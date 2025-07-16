"use client";

import React, { useState } from "react";
import { Inter, DM_Sans } from "next/font/google";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

type FeatureID = "extraction" | "summary" | "reports";

interface FeaturePoint {
    icon: string;
    title: string;
    description: string;
}

interface Feature {
    title: string;
    description: string;
    points: FeaturePoint[];
}

interface Tab {
    id: FeatureID;
    label: string;
}

const FeaturesSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FeatureID>("extraction");

    const features: Record<FeatureID, Feature> = {
        extraction: {
            title: "Find Real Cases, Not Hallucinations",
            description: "Our AI doesn't guess - it retrieves. With AITHENA, every case you see is grounded in real precedent, extracted directly from authoritative legal databases in response to your query.",
            points: [
                {
                    icon: "",
                    title: "Prompt-to-Precedent:",
                    description: "Ask a question or describe your legal scenario - Our system pulls only real, relevant cases."
                },
                {
                    icon: "",
                    title: "Cited and Verified:",
                    description: "Every extracted case includes proper citations and direct links to source material - no fabrications, no AI hallucinations."
                },
                {
                    icon: "",
                    title: "Reliable for Practice:",
                    description: "Whether for research, drafting, or courtroom use, trust that your results are legally sound and contextually accurate."
                },
            ]
        },
        summary: {
            title: "Summarize with Confidence",
            description: "AITHENA's smart summarization doesn't just save time - it builds trust. Every summary we generate is traceable back to its source, so you can verify context, jump to the original document, and never lose sight of what matters.",
            points: [
                {
                    icon: "",
                    title: "Traceable Summaries:",
                    description: "Click on any sentence to instantly view the exact section of the source it came from."
                },
                {
                    icon: "",
                    title: "Built for Legal Precision:",
                    description: "Know exactly how and where each insight was derived - no guesswork, just transparency."
                },
                {
                    icon: "",
                    title: "Faster, Smarter Reading:",
                    description: "Get to the heart of complex cases while keeping full control over depth and detail."
                },
            ]
        },
        reports: {
            title: "Generate Reports, Your Way",
            description: "Save time and effort with AITHENA's flexible report builder. Select the cases that matter the most, edit them directly within your browser, and export polished documents in PDF or Word format-perfectly tailored to your needs.",
            points: [
                {
                    icon: "",
                    title: "Editable Case Selection",
                    description: "Choose relevant cases and reorder them to match your argument flow or internal structure."
                },
                {
                    icon: "",
                    title: "Editable Case Selection",
                    description: "Choose relevant cases and reorder them to match your argument flow or internal structure."
                },
                {
                    icon: "",
                    title: "Editable Case Selection",
                    description: "Choose relevant cases and reorder them to match your argument flow or internal structure."
                },
            ]
        }
    };

    const tabs: Tab[] = [
        {
            id: "extraction",
            label: "Case Extraction"
        },
        {
            id: "summary",
            label: "Case Summary"
        },
        {
            id: "reports",
            label: "Report Generation"
            
        }
    ];

    return (
        <section id = "features-section" className = "py-20 px-6 bg-[#FAF0E6]">
            <div className = "px-40">
                <div className = "text-center mb-16">
                    <div className = "flex justify-center mb-12">
                        <h2 className = {`${dmSans.className} text-7xl font-light text-left text-gray-800`}>
                            Our Features
                        </h2>
                    </div>
                    <div className = "flex justify-center gap-14 mb-16">
                        {tabs.map((tab: Tab) => (
                            <button
                                key = {tab.id}
                                onClick = {() => setActiveTab(tab.id)}
                                className = {`${inter.className} px-8 py-3 rounded-full text-base font-medium transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? "bg-gray-800 text-white shadow-lg"
                                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className = "h-[600px] grid lg:grid-cols-2 gap-36 items-start">
                    <div className = "order-2 lg:order-1 h-full">
                        <div className = "overflow-hidden border p-4 h-full flex items-center justify-center">
                            <img
                                src={
                                    activeTab === "extraction" ? "/case-extraction-feature.jpg" :
                                    activeTab === "summary" ? "/case-summary-feature.jpg" :
                                    "/report-generation-feature.jpg"
                                }
                                alt={
                                    activeTab === "extraction" ? "Case Extraction Interface" :
                                    activeTab === "summary" ? "Case Summary View" :
                                    "Report Generation Tool"
                                }
                                className = "max-w-full max-h-full object-contain"
                            />
                        </div>
                    </div>
                    <div className = "order-1 lg:order-2 h-full flex flex-col justify-center">
                        <div key = {activeTab} className = "animate-fadeIn">
                            <h3 className = {`${dmSans.className} text-4xl font-light text-gray-800 mb-6`}>
                                {features[activeTab].title}
                            </h3>
                            <p className = {`${inter.className} text-gray-600 text-lg leading-relaxed mb-8`}>
                                {features[activeTab].description}
                            </p>
                            <div className = "space-y-6">
                                {features[activeTab].points.map((point: FeaturePoint, index: number) => (
                                    <div key = {index} className = "flex items-start gap-4">
                                        <span className = "text-2xl flex-shrink-0 mt-1">
                                            {point.icon}
                                        </span>
                                        <div>
                                            <h4 className = {`${dmSans.className} font-semibold text-xl text-gray-800 mb-2`}>
                                                {point.title}
                                            </h4>
                                            <p className = {`${inter.className} text-gray-600 text-lg leading-relaxed`}>
                                                {point.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translate(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}
            </style>
        </section>
    );
};

export default FeaturesSection;