import { JSX } from "react";
import { Inter, DM_Sans } from "next/font/google";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

interface TeamMember {
    name: string;
    role?: string;
    bio?: string;
    image?: string;
}

interface TeamSection {
    title: string;
    description: string;
    categories?: {
        [key: string]: TeamMember[];
    };
    members?: TeamMember[];
}

const teamSections: TeamSection[] = [
    {
        title: "The Founders",
        description: "Our story began with a shared vision: to build something meaningful, impactful, and lasting. Founded by a passionate team of eight, our company brings together a diverse group of individuals who believe in challenging the status quo and creating solutions that make a difference.\n\nAt the heart of our journey are three shareholders - the core visionaries who laid the foundation, invested in the dream, and continue to drive our mission forward.\n\nAlongside them, our five founding members played an equally pivotal role, bringing their expertise, energy, and heart to shape the company in its earliest days.\n\nEach founder, whether shareholder or early member, brought unique perspectives and skills to the table - bound together by a shared commitment to excellence, innovation, and integrity.\n\nTogether, this founding team set the tone for who we are today: a company built not just on ideas, but on teamwork, trust, and a relentless pursuit of better.",
        categories: {
            "Legal": [
                { name: "Aaron Tan" },
                { name: "Issac Lee" },
                { name: "Stephanie Goh" }
            ],
            "Technical": [
                { name: "Darrius Cheong" },
                { name: "Hariharan" },
                { name: "Jensen Soo" }
            ]
        }
    },
    {
        title: "Legal Experts",
        description: "Our network of contributing lawyers spans across Asia and London, bringing together a diverse blend of legal insight, jurisdictional knowledge, and practical experience.\n\nThey come from a wide range of legal fields - from corporate law, arbitration, and intellectual property to criminal defence, data protection, and public interest litigation.\n\nWe're proud to feature experts from top-tier international firms, boutique practices, and in-house counsel roles, each offering a unique perspective shaped by their region, practice, and professional journey.\n\nTogether, they help us bridge local nuance with global relevance, ensuring the legal insights we deliver are both technically sound and practically valuable.",
        categories: {
            "Disputes": [
                { name: "Shirin Chew" },
                { name: "Jaiesh Sachi" }
            ],
            "Transactions": [
                { name: "Linus Koh" },
                { name: "Samuel Lee" },
                { name: "Natania Peh" }
            ],
            "General": [
                { name: "Adele Ling" },
                { name: "Benjamin Bay" },
                { name: "Jonathan Teo" },
                { name: "Justinian" },
                { name: "Zavier Wu" },
                { name: "Mindy Foo" },
                { name: "Elynna" },
                { name: "Clarissa" },
                { name: "Benjamin Ngew" }
            ]
        }
    },
    {
        title: "Developers",
        description: "Our community of developers brings together a diverse range of technical expertise and academic backgrounds, united by a shared passion for building meaningful solutions.\n\nThey come from varied domains - from software engineering and machine learning to data science and cybersecurity - contributing deep, hands-on knowledge that powers our platform.\n\nWe're proud to be supported by talent from Singapore's top universities, including SMU, NUS, and NTU, with backgrounds spanning Bachelor's, Master's, and PhD programmes.\n\nWhether designing infrastructure, refining algorithms, or safeguarding our systems, their work reflects rigour, creativity, and a strong sense of purpose.",
        categories: {
            "Frontend": [
                { name: "Tiki" },
                { name: "Faris Chew" }
            ],
            "Backend": [
                
            ],
            "Data Science": [
                { name: "Li Yang" },
                { name: "Xavier Hau" }
            ]
        }
    },
    {
        title: "Business Development",
        description: "Our consultants provide the strategic depth and cross-disciplinary thinking that strengthen every layer of our work - from product to policy, from legal to technology.\n\nThey come from a range of professional backgrounds, including management consulting, legal innovation, academia, and industry, offering insights that help us frame challenges, uncover opportunities, and make better decisions.\n\nMany have held roles in global consultancies, research institutions, and government-linked organisations, and bring a wealth of experience advising across sectors and borders.\n\nWhether guiding product direction, shaping operational frameworks, or validating use cases, their contributions reflect rigour, clarity, and a sharp understanding of impact.\n\nTogether, they help us stay grounded, focused, and future-ready.",
        categories: {
            "Strategy": [
                { name: "Nicholas Low" }
            ],
            "Finance": [
                { name: "Shawn Ng" },
                { name: "Ritchie" },
                { name: "Poh Yong Shun" }
            ]
        }
    },
    {
        title: "Media",
        description: "Our media contributors play a vital role in shaping how our stories are told and how our work is seen.\n\nThey bring together talent from across visual storytelling, design, branding, and digital content, translating complex ideas into compelling narratives and accessible formats.\n\nFrom crafting user-friendly interfaces to producing multimedia content and brand visuals, their contributions reflect both creative flair and strategic clarity.\n\nMany of them come from interdisciplinary backgrounds, blending experience in journalism, communications, marketing, and tech - with training from leading institutions and creative agencies.\n\nTogether, they help us amplify voices, clarify messages, and build trust through design and storytelling that resonate across audiences.",
        categories: {
            "Digital Content": [
                { name: "Jaime" },
                { name: "Prata" }
            ]
        }
    }
];

const TeamSection: React.FC<{ section: TeamSection }> = ({ section }) => {
    const renderMembers = (members: TeamMember[]) => (
        <div className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => (
                <div key = {index} className = "text-center text-gray-700 py-2 px-4 bg-white rounded-md shadow-sm">
                    <span className = {`${inter.className} font-medium`}> {member.name} </span>
                </div>
            ))}
        </div>
    );

    const renderCategories = (categories: { [key: string]: TeamMember[] }) => {
        const categoryEntries = Object.entries(categories);
        const categoryCount = categoryEntries.length;

        const getGridClasses = () => {
            if (categoryCount === 1) {
                return "grid grid-cols-1 max-w-md mx-auto";
            } else if (categoryCount === 2) {
                return "grid grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto divide-y md:divide-y-0 md:divide-x divide-gray-100";
            }
            return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100";
        };

        return (
            <div className = "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className={getGridClasses()}>
                    {categoryEntries.map(([category, members]) => (
                        <div key = {category} className = "p-8 text-center">
                            <div className = "mb-6">
                                <h4 className = {`${dmSans.className} font-semibold text-gray-900 text-lg tracking-wide uppercase`}>
                                    {category}
                                </h4>
                                <div className = "mt-2 w-12 h-0.5 bg-blue-600 mx-auto" />
                            </div>
                            <div className = "space-y-3">
                                {members.length > 0 ? (
                                    members.map((member, index) => (
                                        <div key={index} className = {`${inter.className} text-gray-700 font-medium`}>
                                            {member.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className={`${inter.className} text-gray-400 italic text-sm`}>
                                        Coming soon
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className = "py-20 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className = "bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className = "p-8 lg:p-12">
                        <div className = "text-center mb-10">
                            <h2 className = {`${dmSans.className} text-5xl font-thin text-gray-900 mb-4`}>
                                {section.title}
                            </h2>   
                            <div className = "w-20 h-1 bg-blue-600 mx-auto" />  
                        </div>       
                        <div className = "prose prose-xl max-w-none text-gray-600 mb-12 leading-relaxed text-left">
                            {section.description.split('\n\n').map((paragraph, index) => (
                                <p key = {index} className = {`${inter.className} mb-6 text-xl leading-8`}>
                                    {paragraph}
                                </p>
                            ))}                        
                        </div>
                        <div className = "mt-12">
                            {section.categories && renderCategories(section.categories)}
                            {section.members && renderMembers(section.members)}
                        </div>        
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function Team(): JSX.Element {
    return (
        <div className = "min-h-screen bg-white">
            <div className = "bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24">
                <div className = "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className = "mb-8 text-center">
                        <h1 className = {`${dmSans.className} text-6xl font-semibold tracking-tight text-gray-900 sm:text-6xl mb-6`}>
                            Meet the Team
                        </h1>
                        <div className = "w-24 h-1.5 bg-blue-600 mx-auto" />
                    </div>
                
                    <div className = "prose prose-xl text-2xl max-w-none text-gray-700 leading-relaxed text-left">
                        <p className = {`${inter.className} mb-10 text-2xl`}>
                            At the heart of our work lies a diverse community of dedicated professionals. This page is our way of recognising and honouring the individuals who have generously shared their time, expertise, and insight to shape what we do.
                        </p>
                        <p className = {`${inter.className} mb-10 text-2xl`}>
                            Whether through research, writing, advisory input, or practical experience from the frontlines of the legal world, each contributor plays a vital role in ensuring the quality, relevance, and accuracy of our platform.
                        </p>
                        <p className = {`${inter.className} text-2xl`}>
                            We've built this space to acknowledge their contributions, celebrate the breadth of knowledge they bring - from various regions across Asia to London - and offer you a glimpse into the people powering our mission.
                        </p>
                    </div>
                </div>
            </div>
            {teamSections.map((section, index) => (
                <TeamSection key = {index} section = {section} />
            ))}
        </div>
    );
};