import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PersonalInfo {
  email: string | null;
  phone: string | null;
  github: string | null;
  linkedin: string | null;
}

const Footer = () => {
  const [profileName, setProfileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: null,
    phone: null,
    github: null,
    linkedin: null
  });

  // Fetch the profile name and personal info from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile name
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile name:", profileError);
        } else if (profileData?.name) {
          setProfileName(profileData.name);
        }

        // Fetch personal info using "any" to bypass type checking
        const { data: personalInfoData, error: personalInfoError } = await supabase
          .from('personal_info' as any)
          .select('email, phone, github, linkedin' as any)
          .single();
        
        if (personalInfoError && personalInfoError.code !== 'PGRST116') {
          console.error("Error fetching personal info:", personalInfoError);
        } else if (personalInfoData) {
          // Cast the data to our interface
          setPersonalInfo({
            email: personalInfoData.email || null,
            phone: personalInfoData.phone || null,
            github: personalInfoData.github || null,
            linkedin: personalInfoData.linkedin || null
          });
        }
      } catch (error) {
        console.error("Error in data fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format URLs if they don't start with http:// or https://
  const getGithubUrl = () => {
    if (!personalInfo.github) return null;
    return personalInfo.github.startsWith('http') ? 
      personalInfo.github : 
      `https://github.com/${personalInfo.github}`;
  };

  const getLinkedinUrl = () => {
    if (!personalInfo.linkedin) return null;
    return personalInfo.linkedin.startsWith('http') ? 
      personalInfo.linkedin : 
      `https://linkedin.com/in/${personalInfo.linkedin}`;
  };

  // Get display name - show blank while loading
  const displayName = isLoading ? '' : profileName;
  const displayInitials = isLoading ? '' : profileName.substring(0, 2).toUpperCase();

  return (
    <footer className="w-full bg-secondary/30 py-12 mt-20">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="relative h-6 w-6">
              <div className="absolute inset-0 bg-primary rounded-full animate-pulse opacity-70"></div>
              <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
                <span className="font-bold text-xs text-primary">
                  {displayInitials}
                </span>
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight">{displayName.toUpperCase()}</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            A modern, dark-themed developer portfolio showcasing projects, skills, and experience with a touch of interactivity.
          </p>
          <div className="flex gap-4 mt-4">
            {personalInfo.github && (
              <a href={getGithubUrl() || "#"} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
            )}
            {personalInfo.linkedin && (
              <a href={getLinkedinUrl() || "#"} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">Projects</Link>
            <Link to="/skills" className="text-sm text-muted-foreground hover:text-primary transition-colors">Skills</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            {/* <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Login</Link> */}
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-base font-semibold mb-4">Contact</h3>
          <p className="text-sm text-muted-foreground mb-2">Feel free to reach out if you have any questions or want to work together.</p>
          {personalInfo.email && (
            <a href={`mailto:${personalInfo.email}`} className="text-sm text-primary hover:underline">{personalInfo.email}</a>
          )}
          {personalInfo.phone && (
            <a href={`tel:${personalInfo.phone}`} className="text-sm text-primary hover:underline mt-1">{personalInfo.phone}</a>
          )}
          {!personalInfo.email && !personalInfo.phone && (
            <p className="text-sm text-muted-foreground">Contact information not available</p>
          )}
        </div>
      </div>
      <div className="container mt-8 pt-4 border-t border-muted">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {displayName}. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
