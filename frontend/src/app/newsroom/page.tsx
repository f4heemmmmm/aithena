"use client";

import CategoryPage from "@/components/CategoryPage";

export default function NewsroomPage() {
    return (
        <CategoryPage
            category = {null}
            title = "Newsroom"
            description = "Stay updated with the latest news, insights, and developments from AITHENA."
            currentPath = "/newsroom"
        />
    );
};