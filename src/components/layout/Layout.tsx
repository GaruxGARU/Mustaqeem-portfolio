import React, { useEffect } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideNavBar?: boolean;
}

const Layout = ({ children, hideFooter = false, hideNavBar = false }: LayoutProps) => {
  const location = useLocation();

  // Auto-scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Modified animation on scroll effect
  useEffect(() => {
    // Default opacity for elements to ensure they're visible
    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
      }
    });

    // Optional: keep the animation logic but ensure elements are always visible after
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (entry.target instanceof HTMLElement) {
              entry.target.style.opacity = '1';
              entry.target.style.visibility = 'visible';
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
      observer.observe(element);
    });

    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavBar && <NavBar />}
      <main className={`flex-1 relative z-0 ${!hideNavBar ? 'pt-24' : ''}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
