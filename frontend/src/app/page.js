import UseCases from "@/components/UseCases";
import Description from "@/components/Description";
import ThoughtPieces from "@/components/ThoughtPieces";
import Hero from "@/components/Hero";
import React from "react";

export const metadata = {
  title: 'Legal AI Assistant | Empowering Legal Professionals',
  description: 'AI-powered assistance for legal professionals',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Description />
      <ThoughtPieces />
      <UseCases />
    </main>
  );
}