import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const HeroSection = () => {
  const [profileName, setProfileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the profile name from database
  useEffect(() => {
    const fetchProfileName = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile name:", error);
          setIsLoading(false);
          return;
        }

        if (data?.name) {
          setProfileName(data.name);
        }
      } catch (error) {
        console.error("Error in profile name fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileName();
  }, []);

  // Get display name - show blank while loading
  const displayName = isLoading ? '' : profileName;

  return (
    <div className="container py-20 md:py-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col space-y-6 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-12 bg-primary rounded-full"></div>
            <span className="text-sm font-medium text-muted-foreground">Full-Stack Developer</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Hi, I'm <span className="gradient-text">{displayName}</span>.
            <br />
            I build things <br />
            for the web.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            A passionate developer focused on creating interactive, accessible, and responsive web applications.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/projects">
              <Button size="lg" className="group">
                View Projects
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="https://github.com/GaruxGARU" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="group">
                <Github className="mr-1 h-4 w-4" />
                GitHub Profile
              </Button>
            </a>
          </div>
        </div>
        <div className="flex justify-center md:justify-end relative">
          <div className="relative bg-secondary/30 rounded-xl p-4 w-full max-w-lg aspect-square">
            <div className="absolute top-0 left-0 h-24 w-24 -translate-x-1/4 -translate-y-1/4 bg-primary opacity-50 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-40 w-40 translate-x-1/4 translate-y-1/4 bg-blue-500 opacity-40 rounded-full blur-3xl"></div>
            
            <div className="absolute inset-0 bg-secondary/70 backdrop-blur-sm rounded-xl p-6 flex flex-col overflow-hidden">
              <div className="flex items-center mb-4 gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <div className="ml-4 text-xs text-muted-foreground font-mono">terminal</div>
              </div>
              
              <div className="font-mono text-sm text-primary/90">
                <span className="text-muted-foreground">$</span> <span className="typing-animation inline-block">npm create portfolio@latest</span>
                <div className="mt-2">
                  <span className="text-green-400">✓</span> Installing dependencies...
                </div>
                <div className="mt-2">
                  <span className="text-green-400">✓</span> Setting up project...
                </div>
                <div className="mt-2 animate-pulse">
                  <span className="text-muted-foreground">$</span> <span className="text-primary/90">_</span>
                </div>

                <div className="absolute bottom-6 right-6">
                  <Code className="h-20 w-20 text-primary/20 animate-spin-slow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
