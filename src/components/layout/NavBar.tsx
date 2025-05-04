import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, Github, Linkedin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PersonalInfo {
  github: string | null;
  linkedin: string | null;
}

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [profileName, setProfileName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ github: null, linkedin: null });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch the profile name and personal info from database
  useEffect(() => {
    const fetchProfileData = async () => {
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

        // Fetch personal info (github, linkedin)
        const { data: personalInfoData, error: personalInfoError } = await supabase
          .from('personal_info')
          .select('github, linkedin')
          .single();
        
        if (personalInfoError && personalInfoError.code !== 'PGRST116') {
          console.error("Error fetching personal info:", personalInfoError);
        } else if (personalInfoData) {
          setPersonalInfo({
            github: personalInfoData.github,
            linkedin: personalInfoData.linkedin
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Format URLs if they don't start with http:// or https://
  const getGithubUrl = () => {
    if (!personalInfo.github) return "https://github.com";
    return personalInfo.github.startsWith('http') ? 
      personalInfo.github : 
      `https://github.com/${personalInfo.github}`;
  };

  const getLinkedinUrl = () => {
    if (!personalInfo.linkedin) return "https://linkedin.com";
    return personalInfo.linkedin.startsWith('http') ? 
      personalInfo.linkedin : 
      `https://linkedin.com/in/${personalInfo.linkedin}`;
  };

  // Get display name - show blank while loading
  const displayName = isLoading ? '' : profileName;
  const displayInitials = isLoading ? '' : profileName.substring(0, 2).toUpperCase();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Skills', path: '/skills' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300', 
        isScrolled ? 'bg-background/80 backdrop-blur-md py-3 shadow-md' : 'bg-transparent py-5'
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 bg-primary rounded-full animate-pulse opacity-70"></div>
            <div className="absolute inset-1 bg-background rounded-full flex items-center justify-center">
              <span className="font-bold text-lg text-primary">
                {displayInitials}
              </span>
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight">{displayName.toUpperCase()}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-sm font-medium hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all"
            >
              {item.name}
            </Link>
          ))}

          <div className="flex items-center gap-3 ml-4">
            <a href={getGithubUrl()} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <Github size={20} />
              <span className="sr-only">GitHub</span>
            </a>
            <a href={getLinkedinUrl()} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <Linkedin size={20} />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="animated-border-button ml-4">
                  <span className="relative z-10">Dashboard</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="animated-border-button ml-4">
                <span className="relative z-10">Login</span>
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-40 flex flex-col">
          <nav className="flex flex-col items-center justify-center h-full gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            <div className="flex gap-6 my-4">
              <a href={getGithubUrl()} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <Github size={24} />
                <span className="sr-only">GitHub</span>
              </a>
              <a href={getLinkedinUrl()} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <Linkedin size={24} />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
            
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Button variant="outline" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button>Login</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;
