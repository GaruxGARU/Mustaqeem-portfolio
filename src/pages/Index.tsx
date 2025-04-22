
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import SkillsShowcase from '@/components/home/SkillsShowcase';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProjects />
      <SkillsShowcase />
    </Layout>
  );
};

export default Index;
