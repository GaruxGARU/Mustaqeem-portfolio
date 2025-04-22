import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';
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
}

const certifications = [
  "AWS Certified Developer Associate",
  "Microsoft Certified: Azure Developer Associate",
  "Google Professional Cloud Developer",
  "MongoDB Certified Developer",
  "Certified Kubernetes Administrator"
];

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('');

  // Always fetch latest skills from supabase
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('id, name, category, proficiency, description, projects, years')
          .order('category', { ascending: true })
          .order('proficiency', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          setSkills([]);
        } else {
          console.log(`Loaded ${data.length} skills`);
          setSkills(data as Skill[]);
        }
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

  // Group skills by category (stable across renders)
  const skillsData = useMemo(() => {
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

  // Set the current tab to the first category when data is loaded
  useEffect(() => {
    if (skillsData.length > 0 && !currentTab) {
      setCurrentTab(skillsData[0].id);
    }
  }, [skillsData, currentTab]);

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Skills & Expertise</h1>
          <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
          <p className="text-muted-foreground max-w-2xl">
            My technical skills span frontend and backend development, with expertise in modern web technologies.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12 text-lg">Loading skills...</div>
        ) : error ? (
          <div className="flex justify-center py-12 text-destructive">{error}</div>
        ) : skillsData.length === 0 ? (
          <div className="flex justify-center py-12 text-muted-foreground">No skills found.</div>
        ) : (
          <div className="force-visible">
            <Tabs 
              value={currentTab} 
              onValueChange={setCurrentTab}
              className="mb-16 force-visible" 
              defaultValue={skillsData[0]?.id}
            >
              <TabsList className="mb-8 flex justify-center bg-secondary/30 p-1 w-full max-w-md mx-auto force-visible">
                {skillsData.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex-1 force-visible"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {skillsData.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="force-visible"
                  style={{ opacity: 1, visibility: 'visible', display: category.id === currentTab ? 'block' : 'none' }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 force-visible" style={{ opacity: 1, visibility: 'visible' }}>
                    <div className="md:col-span-2">
                      <Card className="bg-secondary/20 border border-secondary h-full force-visible" style={{ opacity: 1, visibility: 'visible' }}>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-6">
                            {category.name} Skills
                          </h3>
                          <div className="space-y-8">
                            {category.skills.map((skill) => (
                              <div
                                key={skill.id}
                                className="cursor-pointer force-visible"
                                onClick={() => setActiveSkill(skill === activeSkill ? null : skill)}
                                style={{ opacity: 1, visibility: 'visible' }}
                              >
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{skill.name}</span>
                                  <span>{skill.proficiency}%</span>
                                </div>
                                <Progress value={skill.proficiency} className="h-2 mb-2" />
                                <div 
                                  className={`overflow-hidden transition-all duration-300 ${activeSkill?.id === skill.id ? 'max-h-40' : 'max-h-0'}`}
                                  style={{ opacity: 1, visibility: 'visible' }}
                                >
                                  {skill.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{skill.description}</p>
                                  )}
                                  <div className="flex gap-4 mt-2">
                                    {skill.years !== null && (
                                      <span className="text-xs bg-muted/30 px-2 py-1 rounded">{skill.years} years experience</span>
                                    )}
                                    {skill.projects !== null && (
                                      <span className="text-xs bg-muted/30 px-2 py-1 rounded">{skill.projects} projects</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card className="bg-secondary/20 border border-secondary mb-8 force-visible" style={{ opacity: 1, visibility: 'visible' }}>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Experience Level</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Beginner</span>
                              <span className="text-sm">Expert</span>
                            </div>
                            <div className="h-4 bg-muted/30 rounded-full overflow-hidden relative">
                              <div className="absolute top-0 left-0 h-full w-1/5 bg-muted/30 border-r border-background"></div>
                              <div className="absolute top-0 left-1/5 h-full w-1/5 bg-muted/30 border-r border-background"></div>
                              <div className="absolute top-0 left-2/5 h-full w-1/5 bg-muted/30 border-r border-background"></div>
                              <div className="absolute top-0 left-3/5 h-full w-1/5 bg-muted/30 border-r border-background"></div>
                              <div className="absolute top-0 left-4/5 h-full w-1/5 bg-muted/30"></div>
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-blue-500"
                                style={{
                                  width: `${category.skills.reduce((sum, skill) => sum + skill.proficiency, 0) / (category.skills.length || 1)
                                    }%`
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Novice</span>
                              <span>Competent</span>
                              <span>Proficient</span>
                              <span>Expert</span>
                              <span>Master</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-secondary/20 border border-secondary force-visible" style={{ opacity: 1, visibility: 'visible' }}>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Certifications</h3>
                          <ul className="space-y-2">
                            {certifications.map((cert, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                                {cert}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {!loading && !error && skills.length > 0 && (
          <div className="bg-secondary/20 border border-secondary rounded-lg p-8 force-visible" style={{ opacity: 1, visibility: 'visible' }}>
            <h2 className="text-2xl font-semibold mb-6">Skills Cloud</h2>
            <div className="flex flex-wrap justify-center gap-3 force-visible" style={{ opacity: 1, visibility: 'visible' }}>
              {skills.map((skill) => {
                const fontSize = skill ? 0.8 + (skill.proficiency / 100) * 0.8 : 1;
                const opacity = skill ? 0.5 + (skill.proficiency / 100) * 0.5 : 0.75;
                return (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="py-1.5 px-3 force-visible"
                    style={{
                      fontSize: `${fontSize}rem`,
                      opacity: opacity,
                      visibility: 'visible'
                    }}
                  >
                    {skill.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Skills;
