"use client";
import { JSX } from 'react';
import MainSection from './sections/1-main';
import BenefitsSection from './sections/2-benefits';
import FeaturesSection from './sections/3-features';
import ArticlesSection from './sections/4-articles';
import ContactSection from './sections/5-contact';

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <MainSection />
      <BenefitsSection />
      <FeaturesSection />
      <ArticlesSection />
      <ContactSection />
    </div>
  );
}