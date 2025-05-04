import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EditProfileDialog from '@/components/dashboard/EditProfileDialog';
import ManageProjectsDialog from '@/components/dashboard/ManageProjectsDialog';
import ManageSkillsDialog from '@/components/dashboard/ManageSkillsDialog';
import ManageWorkExperienceDialog from '@/components/dashboard/ManageWorkExperienceDialog';
import ManageEducationDialog from '@/components/dashboard/ManageEducationDialog';
import ManagePersonalInfoDialog from '@/components/dashboard/ManagePersonalInfoDialog';
import ManageLanguagesDialog from '@/components/dashboard/ManageLanguagesDialog';
import ManageHobbiesDialog from '@/components/dashboard/ManageHobbiesDialog';
import ManageJourneyDialog from '@/components/dashboard/ManageJourneyDialog';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isManageProjectsOpen, setIsManageProjectsOpen] = useState(false);
  const [isManageSkillsOpen, setIsManageSkillsOpen] = useState(false);
  const [isManageWorkExperienceOpen, setIsManageWorkExperienceOpen] = useState(false);
  const [isManageEducationOpen, setIsManageEducationOpen] = useState(false);
  const [isManagePersonalInfoOpen, setIsManagePersonalInfoOpen] = useState(false);
  const [isManageLanguagesOpen, setIsManageLanguagesOpen] = useState(false);
  const [isManageHobbiesOpen, setIsManageHobbiesOpen] = useState(false);
  const [isManageJourneyOpen, setIsManageJourneyOpen] = useState(false);

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
          <>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>Manage your profile details</CardDescription>
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
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>Manage contact and personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Update your location, contact information, and availability</p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setIsManagePersonalInfoOpen(true)}
                  >
                    Manage Personal Info
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                  <CardDescription>Languages you speak</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Add languages and proficiency levels</p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setIsManageLanguagesOpen(true)}
                  >
                    Manage Languages
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Portfolio Content</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>My Journey</CardTitle>
                  <CardDescription>Your professional story</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Edit the introduction text on your About page</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsManageJourneyOpen(true)}
                  >
                    Edit My Journey
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Your professional journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Add or update your work history and achievements</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsManageWorkExperienceOpen(true)}
                  >
                    Manage Experience
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your educational background</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Add degrees, certificates and academic achievements</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsManageEducationOpen(true)}
                  >
                    Manage Education
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Interests & Hobbies</CardTitle>
                  <CardDescription>Your personal interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Add your hobbies and personal interests</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsManageHobbiesOpen(true)}
                  >
                    Manage Hobbies
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Dialogs */}
        <EditProfileDialog 
          open={isEditProfileOpen} 
          onOpenChange={setIsEditProfileOpen} 
        />
        
        <ManagePersonalInfoDialog
          open={isManagePersonalInfoOpen}
          onOpenChange={setIsManagePersonalInfoOpen}
        />
        
        <ManageLanguagesDialog
          open={isManageLanguagesOpen}
          onOpenChange={setIsManageLanguagesOpen}
        />
        
        <ManageProjectsDialog 
          open={isManageProjectsOpen} 
          onOpenChange={setIsManageProjectsOpen} 
        />
        
        <ManageSkillsDialog 
          open={isManageSkillsOpen} 
          onOpenChange={setIsManageSkillsOpen} 
        />
        
        <ManageWorkExperienceDialog
          open={isManageWorkExperienceOpen}
          onOpenChange={setIsManageWorkExperienceOpen}
        />
        
        <ManageEducationDialog
          open={isManageEducationOpen}
          onOpenChange={setIsManageEducationOpen}
        />

        <ManageHobbiesDialog
          open={isManageHobbiesOpen}
          onOpenChange={setIsManageHobbiesOpen}
        />
        
        <ManageJourneyDialog
          open={isManageJourneyOpen}
          onOpenChange={setIsManageJourneyOpen}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
