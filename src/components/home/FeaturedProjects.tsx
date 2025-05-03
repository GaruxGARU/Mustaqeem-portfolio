import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  tags: string[];
  demo_url: string | null;
  github_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const FeaturedProjects = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, image_url, tags, demo_url, github_url, featured, created_at, updated_at')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load featured projects.');
        setFeaturedProjects([]);
        setLoading(false);
        return;
      }

      const projectsData = ((data ?? []) as Project[]).map(p => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : [],
      }));
      setFeaturedProjects(projectsData);
      setLoading(false);
    };

    fetchFeaturedProjects();
  }, []);

  return (
    <section className="py-20 container">
      <div className="flex flex-col items-center text-center mb-16 animate-on-scroll">
        <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
        <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
        <p className="text-muted-foreground max-w-2xl">
          Here are some of my recent projects that showcase my skills and expertise in building modern web applications.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-lg">Loading featured projects...</div>
      ) : error ? (
        <div className="flex justify-center py-12 text-destructive">{error}</div>
      ) : featuredProjects.length === 0 ? (
        <div className="flex justify-center py-12 text-muted-foreground">No featured projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-secondary/20 border border-secondary overflow-hidden transition-all hover:border-primary/50 flex flex-col animate-on-scroll"
            >
              <div className="aspect-video relative overflow-hidden group">
                <img 
                  src={project.image_url || "/placeholder.svg"} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  {project.tags?.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="backdrop-blur-md bg-secondary/30">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags && project.tags.length > 3 && (
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
                <Button variant="outline" asChild size="sm" className="w-full" disabled={!project.demo_url}>
                  <a href={project.demo_url ?? "#"} target="_blank" rel="noreferrer">Live Demo</a>
                </Button>
                <Button variant="ghost" asChild size="sm" className="w-full" disabled={!project.github_url}>
                  <a href={project.github_url ?? "#"} target="_blank" rel="noreferrer">Source Code</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

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
