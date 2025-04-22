
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SkillCategory {
  name: string;
  skills: string[];
}

const skills: SkillCategory[] = [
  {
    name: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Material UI"]
  },
  {
    name: "Backend",
    skills: ["Node.js", "Express", "NestJS", "Python", "Django", "FastAPI", "GraphQL"]
  },
  {
    name: "Database",
    skills: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Prisma", "Supabase"]
  },
  {
    name: "DevOps & Tools",
    skills: ["Docker", "AWS", "CI/CD", "Git", "GitHub Actions", "Vercel", "Netlify"]
  }
];

const SkillsShowcase = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((category, index) => (
            <Card key={category.name} className="animate-on-scroll bg-secondary/20 border border-secondary overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
                  {category.name}
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline"
                      className="bg-background hover:bg-secondary transition-colors px-3 py-1 text-sm"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
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
