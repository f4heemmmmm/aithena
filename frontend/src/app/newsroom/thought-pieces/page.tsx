// frontend/src/app/newsroom/thought-pieces/page.tsx

"use client";

import CategoryPage from "@/components/CategoryPage";
import { BlogCategory } from "@/services/blogService";

export default function ThoughtPiecesPage() {
    return (
        <CategoryPage 
            category={BlogCategory.THOUGHT_PIECES}
            title="Thought Pieces"
            description="Explore our in-depth analysis, thought leadership articles, and expert insights on industry trends and innovation."
            currentPath="/newsroom/thought-pieces"
        />
    );
}