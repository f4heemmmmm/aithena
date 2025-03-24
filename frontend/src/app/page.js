import Section1 from "@/components/Section1";
import Section2 from "@/components/Section2";
import Section3 from "@/components/Section3";
import Section4 from "@/components/Section4";

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