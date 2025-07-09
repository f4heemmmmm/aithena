"use client";

import CategoryPage from "@/components/CategoryPage";
import { BlogCategory } from "@/services/blogService";

export default function AwardsRecognitionPage() {
    return (
        <CategoryPage
            category = {BlogCategory.AWARDS_RECOGNITION}
            title = "Awards & Recognition"
            description = "Celebrating our industry awards, recognitions and accolades that acknowledge our commitment to excellence and innovation."
            currentPath = "/newsroom/awards-recognition"
        />
    );
};