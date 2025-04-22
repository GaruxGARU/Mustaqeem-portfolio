
import React from 'react';
import { Link } from 'react-router-dom';
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
}

const featuredProjects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Dashboard",
    description: "A feature-rich dashboard for e-commerce stores with real-time analytics, inventory management, and customer insights.",
    imageUrl: "/placeholder.svg",
    tags: ["React", "TypeScript", "Tailwind", "Chart.js"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: 2,
    title: "AI Content Generator",
    description: "A web app that uses AI to generate content for blogs, social media, and marketing materials with customization options.",
    imageUrl: "/placeholder.svg",
    tags: ["NextJS", "OpenAI API", "Prisma", "PostgreSQL"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: 3,
    title: "Fitness Tracker App",
    description: "A mobile-first application for tracking workouts, nutrition, and progress with data visualization.",
    imageUrl: "/placeholder.svg",
    tags: ["React Native", "Firebase", "Redux", "D3.js"],
    demoUrl: "#",
    githubUrl: "#",
  },
];

const FeaturedProjects = () => {
  return (
    <section className="py-20 container">
      <div className="flex flex-col items-center text-center mb-16 animate-on-scroll">
        <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
        <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
        <p className="text-muted-foreground max-w-2xl">
          Here are some of my recent projects that showcase my skills and expertise in building modern web applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredProjects.map((project) => (
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
                  <Badge key={index} variant="secondary" className="backdrop-blur-md bg-secondary/30">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="secondary" className="backdrop-blur-md bg-secondary/30">
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
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

      <div className="flex justify-center mt-12">
        <Link to="/projects">
          <Button variant="outline" size="lg">
            View All Projects
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProjects;
