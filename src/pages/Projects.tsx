import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, image_url, tags, demo_url, github_url, featured, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load projects.');
        setProjects([]);
        setAllTags([]);
        setLoading(false);
        return;
      }

      const projectsData = ((data ?? []) as Project[]).map(p => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : [],
      }));
      setProjects(projectsData);

      const tagSet = new Set<string>();
      projectsData.forEach((project) => {
        if (Array.isArray(project.tags)) {
          project.tags.forEach((tag) => {
            if (typeof tag === 'string' && tag.trim() !== '') tagSet.add(tag.trim());
          });
        }
      });
      setAllTags([...tagSet].sort());
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!filter) return projects;
    return projects.filter((project) =>
      Array.isArray(project.tags) &&
      project.tags.some(tag => tag === filter)
    );
  }, [projects, filter]);

  useEffect(() => {
    if (projects.length > 0) {
      console.log("Projects loaded:", projects.length);
      console.log("First project:", projects[0]);
    }
  }, [projects]);

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-16">
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
            >
              All
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={filter === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 text-lg">Loading projects...</div>
        ) : error ? (
          <div className="flex justify-center py-12 text-destructive">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex justify-center py-12 text-muted-foreground">No projects found for this filter.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-secondary/20 border border-secondary overflow-hidden transition-all hover:border-primary/50 flex flex-col"
                style={{ opacity: 1, visibility: 'visible' }}
              >
                <div className="aspect-video relative overflow-hidden group">
                  <img
                    src={project.image_url || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                      console.log("Failed to load image for:", project.title);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    {project.tags?.slice(0, 3).map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className={`backdrop-blur-md bg-secondary/30 ${filter === tag ? 'bg-primary/30' : ''}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {project.tags && project.tags.length > 3 && (
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
      </div>
    </Layout>
  );
};

export default Projects;
