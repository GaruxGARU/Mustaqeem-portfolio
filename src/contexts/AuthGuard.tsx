import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard provides proper session persistence and prevents 
 * unwanted redirects when switching tabs or refreshing
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Store current path to localStorage when location changes
  useEffect(() => {
    if (!loading && initialized) {
      localStorage.setItem('lastPath', location.pathname);
    }
  }, [location.pathname, loading, initialized]);

  // Handle initial session loading only once
  useEffect(() => {
    if (!loading && !initialized) {
      setInitialized(true);
    }
  }, [loading, initialized]);

  return <>{children}</>;
};