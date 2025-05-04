import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PersonalInfo {
  github: string | null;
}

interface ProfileData {
  name: string | null;
  bio: string | null;
  headline: string | null;
  description: string | null;
  avatar_url: string | null;
}

const HeroSection = () => {
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState(''); // Default value
  const [profileHeadline, setProfileHeadline] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ github: null });

  // Fetch the profile name and personal info from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, bio, headline, description, avatar_url')
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile data:", profileError);
        } else if (profileData) {
          setProfileName(profileData.name || '');
          
          // Only update if values exist and aren't empty
          if (profileData.bio && profileData.bio.trim() !== '') {
            setProfileBio(profileData.bio);
          }
          
          if (profileData.headline && profileData.headline.trim() !== '') {
            setProfileHeadline(profileData.headline);
          }
          
          if (profileData.description && profileData.description.trim() !== '') {
            setProfileDescription(profileData.description);
          }

          if (profileData.avatar_url) {
            setProfileAvatar(profileData.avatar_url);
          }
        }

        // Fetch personal info (github)
        const { data: personalInfoData, error: personalInfoError } = await supabase
          .from('personal_info')
          .select('github')
          .single();
        
        if (personalInfoError && personalInfoError.code !== 'PGRST116') {
          console.error("Error fetching personal info:", personalInfoError);
        } else if (personalInfoData) {
          setPersonalInfo({
            github: personalInfoData.github
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format GitHub URL if it doesn't start with http:// or https://
  const getGithubUrl = () => {
    if (!personalInfo.github) return "https://github.com";
    return personalInfo.github.startsWith('http') ? 
      personalInfo.github : 
      `https://github.com/${personalInfo.github}`;
  };

  // Get display name - show blank while loading
  const displayName = isLoading ? '' : profileName;

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profileName) return "?";
    return profileName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container py-20 md:py-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col space-y-6 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-12 bg-primary rounded-full"></div>
            <span className="text-sm font-medium text-muted-foreground">{profileBio}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Hi, I'm <span className="gradient-text">{displayName}</span>.
            <br />
            {profileHeadline.split('\n').map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            {profileDescription}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/projects">
              <Button size="lg" className="group">
                View Projects
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href={getGithubUrl()} target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="group">
                <Github className="mr-1 h-4 w-4" />
                GitHub Profile
              </Button>
            </a>
          </div>
        </div>
        <div className="flex justify-center md:justify-end relative">
          <div className="relative rounded-xl p-2 md:p-4 w-full max-w-lg aspect-square shadow-lg border border-secondary/20 overflow-hidden">
            {/* Profile Picture */}
            <div className="w-full h-full relative z-10 flex items-center justify-center" id="sun-target-area">
              <div className="animate-float">
          <Avatar className="w-64 h-64 border-4 border-primary/20 shadow-xl">
            <AvatarImage src={profileAvatar} alt={profileName} />
            <AvatarFallback className="text-6xl bg-secondary/50">{getInitials()}</AvatarFallback>
          </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
