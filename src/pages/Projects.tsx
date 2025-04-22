
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
}

const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Dashboard",
    description: "A feature-rich dashboard for e-commerce stores with real-time analytics, inventory management, and customer insights.",
    imageUrl: "/placeholder.svg",
    tags: ["React", "TypeScript", "Tailwind", "Chart.js"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true
  },
  {
    id: 2,
    title: "AI Content Generator",
    description: "A web app that uses AI to generate content for blogs, social media, and marketing materials with customization options.",
    imageUrl: "/placeholder.svg",
    tags: ["NextJS", "OpenAI API", "Prisma", "PostgreSQL"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true
  },
  {
    id: 3,
    title: "Fitness Tracker App",
    description: "A mobile-first application for tracking workouts, nutrition, and progress with data visualization.",
    imageUrl: "/placeholder.svg",
    tags: ["React Native", "Firebase", "Redux", "D3.js"],
    demoUrl: "#",
    githubUrl: "#",
    featured: true
  },
  {
    id: 4,
    title: "Weather Forecast App",
    description: "A weather application showing current conditions and forecasts with interactive maps and location-based searches.",
    imageUrl: "/placeholder.svg",
    tags: ["JavaScript", "Weather API", "Leaflet", "CSS"],
    demoUrl: "#",
    githubUrl: "#",
    featured: false
  },
  {
    id: 5,
    title: "Task Management System",
    description: "A collaborative task manager with boards, lists, and cards, supporting real-time updates and team assignments.",
    imageUrl: "/placeholder.svg",
    tags: ["Vue.js", "Firebase", "Vuex", "Tailwind"],
    demoUrl: "#",
    githubUrl: "#",
    featured: false
  },
  {
    id: 6,
    title: "Developer Blog Platform",
    description: "A platform for developers to publish articles, tutorials, and documentation with markdown support and code highlighting.",
    imageUrl: "/placeholder.svg",
    tags: ["Next.js", "MDX", "Sanity CMS", "Vercel"],
    demoUrl: "#",
    githubUrl: "#",
    featured: false
  },
];

// Extract all unique tags
const allTags = Array.from(new Set(projects.flatMap(project => project.tags)));

const Projects = () => {
  const [filter, setFilter] = useState<string | null>(null);
  
  const filteredProjects = filter 
    ? projects.filter(project => project.tags.includes(filter))
    : projects;

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-16 animate-on-scroll">
          <h1 className="text-4xl font-bold mb-4">My Projects</h1>
          <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
          <p className="text-muted-foreground max-w-2xl">
            Explore my portfolio of projects spanning web applications, mobile apps, and various other software solutions.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-medium mb-4">Filter by technology:</h2>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === null ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter(null)}
              className="animate-on-scroll"
            >
              All
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={filter === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(tag)}
                className="animate-on-scroll"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-secondary/20 border border-secondary overflow-hidden transition-all hover:border-primary/50 flex flex-col animate-on-scroll">
              <div className="aspect-video relative overflow-hidden group">
                <img 
                  src={project.imageUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className={`backdrop-blur-md bg-secondary/30 ${filter === tag ? 'bg-primary/30' : ''}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="secondary" className="backdrop-blur-md bg-secondary/30">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>
                {project.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default" className="backdrop-blur-md bg-primary/70">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-6 flex-grow">
                <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                <p className="text-muted-foreground text-sm">{project.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex gap-3">
                <Button variant="outline" asChild size="sm" className="w-full">
                  <a href={project.demoUrl} target="_blank" rel="noreferrer">Live Demo</a>
                </Button>
                <Button variant="ghost" asChild size="sm" className="w-full">
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">Source Code</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
