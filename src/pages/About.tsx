import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleUser, Book, Briefcase, Code, FolderGit2, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TimelineItem {
  id: string;
  title: string;
  organization?: string;
  company_name?: string;
  position?: string;
  period?: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
  location?: string | null;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  description: string | null;
  projects: number | null;
  years: number | null;
}

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

interface PersonalInfo {
  id: string;
  full_name: string | null;
  location: string | null;
  email: string | null;
  available_for: string[] | null;
  phone: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  created_at: string;
  updated_at: string;
}

interface Language {
  id: string;
  user_id: string;
  language: string;
  proficiency: string;
  is_native: boolean;
  created_at: string;
  updated_at: string;
}

const About = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [workExperience, setWorkExperience] = useState<TimelineItem[]>([]);
  const [education, setEducation] = useState<TimelineItem[]>([]);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name, category, proficiency')
          .order('proficiency', { ascending: false })
          .limit(10);

        if (skillsError) throw new Error(skillsError.message);

        // Fetch featured projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, title, description, image_url, tags, demo_url, github_url')
          .eq('featured', true)
          .limit(3);

        if (projectsError) throw new Error(projectsError.message);
        
        // Fetch work experience - first get all items, then sort them manually
        const { data: workData, error: workError } = await supabase
          .from('work_experience')
          .select('id, title, company_name, position, start_date, end_date, current, description, location, tags, created_at, updated_at');
          
        if (workError) throw new Error(workError.message);
        
        // Fetch education - first get all items, then sort them manually
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('id, title, institution_name, organization, start_date, end_date, current, description, location, tags, created_at, updated_at');
          
        if (educationError) throw new Error(educationError.message);
        
        // Fetch personal info
        const { data: personalInfoData, error: personalInfoError } = await supabase
          .from('personal_info')
          .select('*')
          .single();
          
        if (personalInfoError && personalInfoError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is fine - just means no personal info yet
          throw new Error(personalInfoError.message);
        }
        
        // Fetch languages
        const { data: languagesData, error: languagesError } = await supabase
          .from('languages')
          .select('*')
          .order('is_native', { ascending: false });
          
        if (languagesError) throw new Error(languagesError.message);

        setSkills(skillsData as Skill[]);
        
        const processedProjectsData = ((projectsData ?? []) as Project[]).map(p => ({
          ...p,
          tags: Array.isArray(p.tags) ? p.tags : [],
        }));
        
        setFeaturedProjects(processedProjectsData);
        
        // Process work data and sort: current positions first, then by start_date descending
        const processedWorkData = ((workData ?? []) as TimelineItem[]).map(w => ({
          ...w,
          tags: Array.isArray(w.tags) ? w.tags : [],
        })).sort((a, b) => {
          // First sort by current (true comes before false)
          if (a.current && !b.current) return -1;
          if (!a.current && b.current) return 1;
          
          // Then sort by start_date (newest first)
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        });
        
        setWorkExperience(processedWorkData);
        
        // Process education data and sort: current first, then by start_date descending
        const processedEducationData = ((educationData ?? []) as TimelineItem[]).map(e => ({
          ...e,
          tags: Array.isArray(e.tags) ? e.tags : [],
        })).sort((a, b) => {
          // First sort by current (true comes before false)
          if (a.current && !b.current) return -1;
          if (!a.current && b.current) return 1;
          
          // Then sort by start_date (newest first)
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        });
        
        setEducation(processedEducationData);
        
        // Set personal info and languages
        setPersonalInfo(personalInfoData as PersonalInfo);
        setLanguages(languagesData as Language[]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get the top skills (highest proficiency)
  const topSkills = skills
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, 5);

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-16 animate-on-scroll">
          <h1 className="text-4xl font-bold mb-4">About Me</h1>
          <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
          <p className="text-muted-foreground max-w-2xl">
            Get to know my background, experience, and what drives me as a developer.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-lg animate-on-scroll">
                <img 
                  src="/placeholder.svg" 
                  alt="Profile" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
              </div>
              
              <div className="space-y-6">
                <div className="animate-on-scroll">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <CircleUser className="h-5 w-5 text-primary" />
                    Personal Info
                  </h2>
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading personal info...</p>
                  ) : error ? (
                    <p className="text-sm text-destructive">Error loading personal info</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {personalInfo?.full_name || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Location:</span> {personalInfo?.location || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Email:</span> {personalInfo?.email || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {personalInfo?.phone || 'N/A'}</p>
                      {personalInfo?.available_for && personalInfo.available_for.length > 0 && (
                        <p>
                          <span className="text-muted-foreground">Available for:</span>{' '}
                          {personalInfo.available_for.join(', ')}
                        </p>
                      )}
                      
                      {/* Social Links */}
                      {(personalInfo?.website || personalInfo?.github || personalInfo?.linkedin) && (
                        <div className="pt-2">
                          <p className="text-muted-foreground mb-2">Social Links:</p>
                          <div className="flex flex-wrap gap-3">
                            {personalInfo?.website && (
                              <a 
                                href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
                              >
                                <Globe className="h-4 w-4" /> Website
                              </a>
                            )}
                            {personalInfo?.github && (
                              <a 
                                href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://github.com/${personalInfo.github}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
                              >
                                <FolderGit2 className="h-4 w-4" /> GitHub
                              </a>
                            )}
                            {personalInfo?.linkedin && (
                              <a 
                                href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://linkedin.com/in/${personalInfo.linkedin}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
                              >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg> LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="animate-on-scroll">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Core Skills
                  </h2>
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading skills...</p>
                  ) : error ? (
                    <p className="text-sm text-destructive">Error loading skills</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {topSkills.map((skill) => (
                        <Badge key={skill.id} variant="outline">{skill.name}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="animate-on-scroll">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Languages
                  </h2>
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading languages...</p>
                  ) : error ? (
                    <p className="text-sm text-destructive">Error loading languages</p>
                  ) : languages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No languages found</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {languages.map((language) => (
                        <div key={language.id} className="flex items-center justify-between">
                          <span>
                            {language.language}
                            {language.is_native && (
                              <span className="ml-1 text-xs text-primary">(Native)</span>
                            )}
                          </span>
                          <Badge variant="outline" className="text-xs">{language.proficiency}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <Card className="bg-secondary/20 border border-secondary mb-10 animate-on-scroll">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">My Journey</h2>
                <p className="mb-4 text-muted-foreground">
                  I'm a passionate full-stack developer with over 8 years of experience building web applications
                  that solve real-world problems. My journey in web development began when I built my first website
                  at the age of 14, and I've been hooked ever since.
                </p>
                <p className="mb-4 text-muted-foreground">
                  I specialize in building modern, responsive, and accessible web applications using the latest
                  technologies. I'm constantly learning and exploring new technologies to stay at the forefront
                  of web development.
                </p>
                <p className="text-muted-foreground">
                  When I'm not coding, you can find me hiking, reading science fiction, or experimenting with
                  new recipes in the kitchen. I believe in writing clean, maintainable code and enjoy mentoring
                  other developers.
                </p>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="experience" className="mb-10">
              <TabsList className="mb-8 flex justify-start bg-secondary/30 p-1 w-full max-w-md">
                <TabsTrigger value="experience" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4" />
                  Projects
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="experience" className="animate-on-scroll">
                <h2 className="text-2xl font-semibold mb-6">Work Experience</h2>
                {loading ? (
                  <div className="flex justify-center py-12 text-lg">Loading work experience...</div>
                ) : error ? (
                  <div className="flex justify-center py-12 text-destructive">{error}</div>
                ) : workExperience.length === 0 ? (
                  <div className="flex justify-center py-12 text-muted-foreground">No work experience found.</div>
                ) : (
                  <div className="relative border-l border-primary/50 pl-6 ml-3 space-y-10">
                    {workExperience.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-9 rounded-full bg-secondary/30 border border-primary p-1">
                          <div className="h-3 w-3 rounded-full bg-primary"></div>
                        </div>
                        <div className="mb-1">
                          <h3 className="text-xl font-medium inline-flex items-center">
                            {item.title}
                            <span className="ml-3 text-sm font-normal text-muted-foreground">
                              {format(new Date(item.start_date), 'MMM yyyy')} - {item.current ? 'Present' : format(new Date(item.end_date || ''), 'MMM yyyy')}
                            </span>
                          </h3>
                        </div>
                        <p className="text-primary font-medium mb-3">{item.company_name}</p>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        {item.tags && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="education" className="animate-on-scroll">
                <h2 className="text-2xl font-semibold mb-6">Education</h2>
                {loading ? (
                  <div className="flex justify-center py-12 text-lg">Loading education...</div>
                ) : error ? (
                  <div className="flex justify-center py-12 text-destructive">{error}</div>
                ) : education.length === 0 ? (
                  <div className="flex justify-center py-12 text-muted-foreground">No education found.</div>
                ) : (
                  <div className="relative border-l border-primary/50 pl-6 ml-3 space-y-10">
                    {education.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-9 rounded-full bg-secondary/30 border border-primary p-1">
                          <div className="h-3 w-3 rounded-full bg-primary"></div>
                        </div>
                        <div className="mb-1">
                          <h3 className="text-xl font-medium inline-flex items-center">
                            {item.title}
                            <span className="ml-3 text-sm font-normal text-muted-foreground">
                              {format(new Date(item.start_date), 'MMM yyyy')} - {item.current ? 'Present' : format(new Date(item.end_date || ''), 'MMM yyyy')}
                            </span>
                          </h3>
                        </div>
                        <p className="text-primary font-medium mb-3">{item.organization}</p>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        {item.tags && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="projects" className="animate-on-scroll">
                <h2 className="text-2xl font-semibold mb-6">Featured Projects</h2>
                {loading ? (
                  <div className="flex justify-center py-12 text-lg">Loading projects...</div>
                ) : error ? (
                  <div className="flex justify-center py-12 text-destructive">{error}</div>
                ) : featuredProjects.length === 0 ? (
                  <div className="flex justify-center py-12 text-muted-foreground">No projects found.</div>
                ) : (
                  <div className="space-y-8">
                    {featuredProjects.map((project) => (
                      <Card key={project.id} className="bg-secondary/10 border border-secondary overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {project.image_url && (
                              <div className="md:w-1/3 aspect-video rounded-lg overflow-hidden">
                                <img 
                                  src={project.image_url || "/placeholder.svg"} 
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                            )}
                            <div className={project.image_url ? "md:w-2/3" : "w-full"}>
                              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {project.tags?.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {project.demo_url && (
                                  <a 
                                    href={project.demo_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-sm text-primary hover:text-primary/80 font-medium"
                                  >
                                    Live Demo
                                  </a>
                                )}
                                {project.github_url && (
                                  <a 
                                    href={project.github_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-sm text-primary hover:text-primary/80 font-medium"
                                  >
                                    Source Code
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="animate-on-scroll mb-10">
              <h2 className="text-2xl font-semibold mb-6">Skills Overview</h2>
              {loading ? (
                <div className="flex justify-center py-6 text-lg">Loading skills...</div>
              ) : error ? (
                <div className="flex justify-center py-6 text-destructive">{error}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/10 border border-secondary/50">
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{skill.name}</span>
                          <span>{skill.proficiency}%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="animate-on-scroll">
              <h2 className="text-2xl font-semibold mb-6">Interests & Hobbies</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["Open Source", "Reading", "Hiking", "Gaming", "Photography", "Cooking"].map((hobby, index) => (
                  <div key={index} className="bg-secondary/20 border border-secondary rounded-lg p-4 text-center">
                    <span>{hobby}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
