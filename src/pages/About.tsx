
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleUser, Book, Briefcase, Code } from 'lucide-react';

interface TimelineItem {
  id: number;
  title: string;
  organization: string;
  period: string;
  description: string;
  tags?: string[];
}

const workExperience: TimelineItem[] = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    organization: "Tech Innovators Inc.",
    period: "2021 - Present",
    description: "Leading development of enterprise SaaS platforms. Architecting scalable solutions using React, Node.js, and AWS. Managing a team of developers and mentoring junior team members.",
    tags: ["React", "Node.js", "AWS", "TypeScript", "PostgreSQL"]
  },
  {
    id: 2,
    title: "Frontend Developer",
    organization: "Digital Solutions Co.",
    period: "2018 - 2021",
    description: "Developed responsive web applications with JavaScript frameworks. Implemented design systems and component libraries. Collaborated with UX designers to create intuitive user interfaces.",
    tags: ["JavaScript", "Vue.js", "CSS", "Webpack", "Jest"]
  },
  {
    id: 3,
    title: "Web Developer",
    organization: "Creative Agency",
    period: "2016 - 2018",
    description: "Built websites and web applications for various clients. Created custom WordPress themes and plugins. Optimized site performance and implemented SEO best practices.",
    tags: ["HTML", "CSS", "JavaScript", "WordPress", "PHP"]
  }
];

const education: TimelineItem[] = [
  {
    id: 1,
    title: "MSc in Computer Science",
    organization: "Tech University",
    period: "2015 - 2016",
    description: "Focused on advanced web technologies and distributed systems. Thesis on scalable real-time web applications. Graduated with distinction.",
    tags: ["Distributed Systems", "Algorithms", "Cloud Computing"]
  },
  {
    id: 2,
    title: "BSc in Software Engineering",
    organization: "Engineering College",
    period: "2011 - 2015",
    description: "Comprehensive study of software development principles and practices. Specialized in web technologies and participated in multiple hackathons.",
    tags: ["Web Development", "Data Structures", "Software Design"]
  }
];

const About = () => {
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
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> John Developer</p>
                    <p><span className="text-muted-foreground">Location:</span> San Francisco, CA</p>
                    <p><span className="text-muted-foreground">Email:</span> contact@example.com</p>
                    <p><span className="text-muted-foreground">Available for:</span> Freelance, Full-time</p>
                  </div>
                </div>
                
                <div className="animate-on-scroll">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Core Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">React</Badge>
                    <Badge variant="outline">Node.js</Badge>
                    <Badge variant="outline">JavaScript</Badge>
                    <Badge variant="outline">TypeScript</Badge>
                    <Badge variant="outline">UI/UX</Badge>
                  </div>
                </div>
                
                <div className="animate-on-scroll">
                  <h2 className="text-xl font-semibold mb-3">Languages</h2>
                  <div className="space-y-2 text-sm">
                    <p>English (Native)</p>
                    <p>Spanish (Professional)</p>
                    <p>French (Basic)</p>
                  </div>
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
              <TabsList className="mb-8 flex justify-start bg-secondary/30 p-1 w-full max-w-xs">
                <TabsTrigger value="experience" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Education
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="experience" className="animate-on-scroll">
                <h2 className="text-2xl font-semibold mb-6">Work Experience</h2>
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
                            {item.period}
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
              </TabsContent>
              
              <TabsContent value="education" className="animate-on-scroll">
                <h2 className="text-2xl font-semibold mb-6">Education</h2>
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
                            {item.period}
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
              </TabsContent>
            </Tabs>
            
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
