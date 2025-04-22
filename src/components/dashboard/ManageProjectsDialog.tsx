
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface ManageProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  tags: string[];
  demo_url: string | null;
  github_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const ProjectForm = ({ 
  onSubmit, 
  initialData = null, 
  onCancel 
}: { 
  onSubmit: (data: any) => void;
  initialData?: Project | null;
  onCancel: () => void;
}) => {
  const form = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      image_url: '',
      tags: '',
      demo_url: '',
      github_url: '',
      featured: false
    }
  });

  const handleSubmit = (data: any) => {
    // Convert tags string to array
    const formattedData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : []
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My Awesome Project" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe your project" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/image.jpg" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma separated)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="React, TypeScript, UI/UX" 
                  value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="demo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demo URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://myproject.com" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="github_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://github.com/username/repo" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Featured Project</FormLabel>
                <FormDescription>
                  Display this project prominently on your profile
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Project
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ManageProjectsDialog = ({ open, onOpenChange }: ManageProjectsDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchProjects();
    }
  }, [open, user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const newProject = {
        ...data,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('projects')
        .insert([newProject]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Project created successfully",
      });
      
      setIsEditing(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!user || !currentProject) return;

    try {
      setLoading(true);
      
      const updates = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', currentProject.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      
      setIsEditing(false);
      setCurrentProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!user) return;

    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: any) => {
    if (currentProject) {
      handleUpdateProject(data);
    } else {
      handleCreateProject(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Projects</DialogTitle>
          <DialogDescription>
            Create, update, or remove your portfolio projects.
          </DialogDescription>
        </DialogHeader>
        
        {loading && !isEditing ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : isEditing ? (
          <ProjectForm 
            onSubmit={handleSubmit}
            initialData={currentProject}
            onCancel={() => {
              setIsEditing(false);
              setCurrentProject(null);
            }}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </div>
            
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No projects found. Create your first project!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setCurrentProject(project);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex items-center text-xs text-muted-foreground">
                        {project.featured && (
                          <span className="flex items-center mr-3">
                            <Check className="h-3 w-3 mr-1" /> Featured
                          </span>
                        )}
                        <span>Tags: {project.tags.join(', ') || 'None'}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageProjectsDialog;
