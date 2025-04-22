
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditProfileDialog from '@/components/dashboard/EditProfileDialog';
import ManageProjectsDialog from '@/components/dashboard/ManageProjectsDialog';
import ManageSkillsDialog from '@/components/dashboard/ManageSkillsDialog';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isManageProjectsOpen, setIsManageProjectsOpen] = useState(false);
  const [isManageSkillsOpen, setIsManageSkillsOpen] = useState(false);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">Loading...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Email: {user?.email}</p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Manage your portfolio projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Manage, edit and create new projects to showcase</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsManageProjectsOpen(true)}
                >
                  Manage Projects
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
                <CardDescription>Showcase your technical abilities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Update your skills and proficiency levels</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsManageSkillsOpen(true)}
                >
                  Manage Skills
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialogs */}
        <EditProfileDialog 
          open={isEditProfileOpen} 
          onOpenChange={setIsEditProfileOpen} 
        />
        
        <ManageProjectsDialog 
          open={isManageProjectsOpen} 
          onOpenChange={setIsManageProjectsOpen} 
        />
        
        <ManageSkillsDialog 
          open={isManageSkillsOpen} 
          onOpenChange={setIsManageSkillsOpen} 
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
