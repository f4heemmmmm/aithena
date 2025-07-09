"use client";

import CategoryPage from "@/components/CategoryPage";
import { BlogCategory } from "@/services/blogService";

export default function AchievementsPage() {
    return (
        <CategoryPage
            category = {BlogCategory.ACHIEVEMENTS}
            title = "Achievements"
            description = "Discover our latest milestones, company successes, and significant achievements that mark our journey forward."
            currentPath = "/newsroom/achievements"
        />
    );
};