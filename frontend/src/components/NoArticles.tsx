import { Inter, DM_Sans } from "next/font/google";

const inter = Inter({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

interface NoArticlesProps {
    searchTerm?: string;
    onClearSearch?: () => void;
    variant?: "default" | "search";
}

export default function NoArticles({ searchTerm = "", onClearSearch, variant = "default" }: NoArticlesProps) {
    const isSearchContext = variant === "search" || searchTerm.length > 0;

    return (
        <div className = "text-center py-24 min-h-[400px] flex items-center justify-center">
            <div className = "max-w-2xl mx-auto px-4">
                <h3 className = {`${dmSans.className} text-3xl font-light text-gray-900 mb-6`}>
                    {isSearchContext ? "No articles found" : "No articles available"}
                </h3>

                {/* Description */}
                <div className = "space-y-4 mb-8">
                    <div className = {`${inter.className} text-gray-600 text-lg leading-relaxed`}>
                        {isSearchContext 
                            ? "We couldn\'t find any articles matching your search criteria."
                            : "We\'re working on bringing you valuable content and insights."
                        }
                    </div>
                
                    {isSearchContext && (
                        <div className = {`${inter.className} text-gray-500 text-base`}>
                            Try refining your search terms or browse our other content.
                        </div>
                    )}
                    
                    {!isSearchContext && (
                        <div className = {`${inter.className} text-gray-500 text-base`}>
                            Check back soon for the latest articles and updates.
                        </div>
                    )}
                </div>

                {isSearchContext && onClearSearch && (
                    <div className = "flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick = {onClearSearch}
                            className = {`${inter.className} px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm`}
                        >
                            Clear search
                        </button>
                        <button
                            onClick = {onClearSearch}
                            className = {`${inter.className} px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
                        >
                            View all articles
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};