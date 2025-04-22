
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Skills', path: '/skills' },
    { name: 'About', path: '/about' },
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
              <span className="font-bold text-lg text-primary">GG</span>
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight">GARUXGARU</span>
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
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <Github size={20} />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <Linkedin size={20} />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>

          <Link to="/login">
            <Button variant="outline" className="animated-border-button ml-4">
              <span className="relative z-10">Login</span>
            </Button>
          </Link>
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
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button>Login</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;
