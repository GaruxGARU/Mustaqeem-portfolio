import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  description: string | null;
  projects: number | null;
  years: number | null;
  image_url: string | null;
}

interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

const SkillsShowcase = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('id, name, category, proficiency, image_url')
          .order('category', { ascending: true })
          .order('proficiency', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }
        
        setSkills(data as Skill[]);
      } catch (err) {
        console.error("Error fetching skills:", err);
        setError('Failed to load skills.');
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Group skills by category
  const skillCategories = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    
    skills.forEach(skill => {
      if (!skill.category) {
        return;
      }
      
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }
      
      groups[skill.category].push(skill);
    });
    
    return Object.entries(groups).map(([id, catSkills]) => ({
      id,
      name: id,
      skills: catSkills,
    }));
  }, [skills]);

  return (
    <section className="py-20 bg-secondary/10">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl font-bold mb-4">Skills & Technologies</h2>
          <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
          <p className="text-muted-foreground max-w-2xl">
            I work with a variety of technologies across the full stack to build responsive, scalable applications.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 text-lg">Loading skills...</div>
        ) : error ? (
          <div className="flex justify-center py-12 text-destructive">{error}</div>
        ) : skillCategories.length === 0 ? (
          <div className="flex justify-center py-12 text-muted-foreground">No skills found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillCategories.map((category) => (
              <Card key={category.id} className="animate-on-scroll bg-secondary/20 border border-secondary overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
                    {category.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <Badge 
                        key={skill.id} 
                        variant="outline"
                        className="bg-background hover:bg-secondary transition-colors px-3 py-1 text-sm flex items-center gap-2"
                      >
                        {skill.image_url && (
                          <div className="h-4 w-4 rounded overflow-hidden bg-muted flex-shrink-0">
                            <img 
                              src={skill.image_url} 
                              alt=""
                              className="h-full w-full object-contain" 
                            />
                          </div>
                        )}
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex justify-center mt-12">
          <a href="/skills" className="group inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            <span>View detailed skills & experience</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SkillsShowcase;
