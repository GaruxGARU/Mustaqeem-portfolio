import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  const { toast } = useToast();
  const { updatePassword } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    const checkRecoveryToken = async () => {
      // Check if we have an access_token in the URL hash indicating password recovery
      if (location.hash) {
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log("URL hash parameters detected:", { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
        
        if (accessToken && refreshToken) {
          try {
            // Try to set the session using the recovery token
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error("Error setting session with recovery token:", error);
              toast({
                title: "Invalid or expired recovery link",
                description: "Please request a new password reset link.",
                variant: "destructive",
              });
              setIsTokenValid(false);
            } else {
              console.log("Recovery token is valid, ready for password reset");
              setIsTokenValid(true);
            }
          } catch (err) {
            console.error("Error in recovery flow:", err);
            setIsTokenValid(false);
          }
        } else {
          // No recovery tokens in the URL
          setIsTokenValid(false);
        }
      } else {
        // No hash in the URL
        setIsTokenValid(false);
      }
    };
    
    checkRecoveryToken();
  }, [location, toast]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match and try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsResetting(true);
    
    try {
      const { error, success } = await updatePassword(newPassword);
      
      if (success) {
        toast({
          title: "Password updated successfully",
          description: "Your password has been reset. You can now login with your new password.",
        });
        
        // Clear the hash from URL and redirect to login
        setTimeout(() => {
          window.location.href = window.location.origin + window.location.pathname.replace(/\/reset-password.*/, '/login');
        }, 2000);
      } else {
        console.error("Password update error:", error);
        toast({
          title: "Failed to update password",
          description: error?.message || "An error occurred. Please try again or request a new reset link.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Failed to update password",
        description: "An unexpected error occurred. Please try again or request a new reset link.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  // Show loading state while checking token
  if (isTokenValid === null) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center">
          <div className="w-full max-w-md flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Verifying your reset link...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Invalid token, redirect to login
  if (isTokenValid === false) {
    return <Navigate to="/login" replace />;
  }
  
  // Valid token, show password reset form
  return (
    <Layout>
      <div className="container py-12 flex justify-center">
        <div className="w-full max-w-md">
          <Card className="border-secondary bg-secondary/20">
            <CardHeader>
              <CardTitle>Reset Your Password</CardTitle>
              <CardDescription>
                Please enter a new password for your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isResetting}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isResetting}
                    minLength={6}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isResetting}>
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;