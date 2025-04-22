
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Skill {
  name: string;
  proficiency: number;
  description: string;
  projects: number;
  years: number;
}

interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

const skillsData: SkillCategory[] = [
  {
    id: "frontend",
    name: "Frontend Development",
    skills: [
      { 
        name: "React", 
        proficiency: 90, 
        description: "Building complex interfaces with React, Redux, and modern hooks patterns.",
        projects: 15,
        years: 4
      },
      { 
        name: "TypeScript", 
        proficiency: 85, 
        description: "Type-safe development with advanced TypeScript features.",
        projects: 12,
        years: 3
      },
      { 
        name: "Next.js", 
        proficiency: 80, 
        description: "Server-side rendering, static site generation, and API routes.",
        projects: 8,
        years: 2
      },
      { 
        name: "CSS/Tailwind", 
        proficiency: 95, 
        description: "Creating responsive, accessible designs with modern CSS and Tailwind.",
        projects: 20,
        years: 5
      },
      { 
        name: "JavaScript", 
        proficiency: 90, 
        description: "ES6+ features, async programming, and browser APIs.",
        projects: 25,
        years: 6
      }
    ]
  },
  {
    id: "backend",
    name: "Backend Development",
    skills: [
      { 
        name: "Node.js", 
        proficiency: 85, 
        description: "Building scalable server applications and APIs with Node.js.",
        projects: 10,
        years: 4
      },
      { 
        name: "Express", 
        proficiency: 90, 
        description: "Creating RESTful APIs and middleware with Express.",
        projects: 12,
        years: 4
      },
      { 
        name: "Python", 
        proficiency: 75, 
        description: "Data processing, automation, and web applications with Python.",
        projects: 6,
        years: 3
      },
      { 
        name: "GraphQL", 
        proficiency: 80, 
        description: "Designing efficient GraphQL schemas and resolvers.",
        projects: 5,
        years: 2
      },
      { 
        name: "PostgreSQL", 
        proficiency: 85, 
        description: "Database design, optimization, and complex queries.",
        projects: 9,
        years: 4
      }
    ]
  },
  {
    id: "devops",
    name: "DevOps & Tools",
    skills: [
      { 
        name: "Docker", 
        proficiency: 80, 
        description: "Containerization and multi-container applications with Docker and Docker Compose.",
        projects: 8,
        years: 3
      },
      { 
        name: "Git/GitHub", 
        proficiency: 95, 
        description: "Version control, CI/CD workflows, and collaboration.",
        projects: 30,
        years: 6
      },
      { 
        name: "AWS", 
        proficiency: 70, 
        description: "Deploying and managing applications on AWS services.",
        projects: 5,
        years: 2
      },
      { 
        name: "CI/CD", 
        proficiency: 85, 
        description: "Automated testing and deployment pipelines.",
        projects: 10,
        years: 3
      },
      { 
        name: "Linux", 
        proficiency: 75, 
        description: "Server administration and shell scripting.",
        projects: 12,
        years: 4
      }
    ]
  }
];

const certifications = [
  "AWS Certified Developer Associate",
  "Microsoft Certified: Azure Developer Associate",
  "Google Professional Cloud Developer",
  "MongoDB Certified Developer",
  "Certified Kubernetes Administrator"
];

const Skills = () => {
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  
  return (
    <Layout>
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-16 animate-on-scroll">
          <h1 className="text-4xl font-bold mb-4">Skills & Expertise</h1>
          <div className="h-1 w-20 bg-primary rounded-full mb-6"></div>
          <p className="text-muted-foreground max-w-2xl">
            My technical skills span frontend and backend development, with expertise in modern web technologies.
          </p>
        </div>

        <Tabs defaultValue="frontend" className="mb-16">
          <TabsList className="mb-8 flex justify-center bg-secondary/30 p-1 w-full max-w-md mx-auto">
            {skillsData.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex-1"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {skillsData.map((category) => (
            <TabsContent 
              key={category.id} 
              value={category.id}
              className="animate-on-scroll"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card className="bg-secondary/20 border border-secondary h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-6">{category.name} Skills</h3>
                      
                      <div className="space-y-8">
                        {category.skills.map((skill) => (
                          <div 
                            key={skill.name}
                            className="cursor-pointer"
                            onClick={() => setActiveSkill(skill === activeSkill ? null : skill)}
                          >
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{skill.name}</span>
                              <span>{skill.proficiency}%</span>
                            </div>
                            <Progress value={skill.proficiency} className="h-2 mb-2" />
                            
                            <div className={`overflow-hidden transition-all duration-300 ${activeSkill?.name === skill.name ? 'max-h-40' : 'max-h-0'}`}>
                              <p className="text-sm text-muted-foreground mt-2">{skill.description}</p>
                              <div className="flex gap-4 mt-2">
                                <span className="text-xs bg-muted/30 px-2 py-1 rounded">{skill.years} years experience</span>
                                <span className="text-xs bg-muted/30 px-2 py-1 rounded">{skill.projects} projects</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="bg-secondary/20 border border-secondary mb-8">
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
                            style={{ width: `${category.skills.reduce((sum, skill) => sum + skill.proficiency, 0) / category.skills.length}%` }}
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
                  
                  <Card className="bg-secondary/20 border border-secondary">
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
        
        <div className="bg-secondary/20 border border-secondary rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Skills Cloud</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from(new Set(skillsData.flatMap(category => 
              category.skills.map(skill => skill.name)
            ))).map((skillName, index) => {
              // Find the skill object
              const skill = skillsData
                .flatMap(category => category.skills)
                .find(s => s.name === skillName);
              
              // Calculate font size based on proficiency
              const fontSize = skill ? 0.8 + (skill.proficiency / 100) * 0.8 : 1;
              const opacity = skill ? 0.5 + (skill.proficiency / 100) * 0.5 : 0.75;
              
              return (
                <Badge 
                  key={index}
                  variant="outline"
                  className="py-1.5 px-3 animate-on-scroll"
                  style={{ 
                    fontSize: `${fontSize}rem`,
                    opacity
                  }}
                >
                  {skillName}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Skills;
