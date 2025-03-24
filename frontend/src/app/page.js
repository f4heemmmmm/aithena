import Hero from "@/components/Hero";
import Description from "@/components/Description";
import ThoughtPieces from "@/components/ThoughtPieces";
import UseCases from "@/components/UseCases";

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