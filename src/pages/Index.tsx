import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import SkillsShowcase from '@/components/home/SkillsShowcase';
import BackgroundAnimation from '@/components/home/BackgroundAnimation';

const Index = () => {
  return (
    <Layout>
      <BackgroundAnimation />
      <div className="relative z-10">
        <HeroSection />
        <FeaturedProjects />
        <SkillsShowcase />
      </div>
    </Layout>
  );
};

export default Index;
