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
  // Fix: Initialize the form with tags as an empty array instead of an empty string
  const form = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      image_url: '',
      tags: [], // Changed from string to empty array
      demo_url: '',
      github_url: '',
      featured: false
    }
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRemoveExistingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    // If we have an initial image (updating a project) and it's from Supabase
    if (initialData?.image_url && initialData.image_url.includes('supabase')) {
      try {
        setRemoveExistingImage(true);
        setImagePreview(null);
        setImageFile(null);
        
        toast({
          title: "Image removed",
          description: "The image will be removed when you save changes",
        });
      } catch (error) {
        console.error("Error processing image removal:", error);
        toast({
          title: "Error",
          description: "Failed to remove image",
          variant: "destructive"
        });
      }
    } else {
      // Just remove the local file/preview
      setImagePreview(null);
      setImageFile(null);
      setRemoveExistingImage(true);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      // Convert tags string to array if it's a string
      const formattedData = {
        ...data,
        tags: typeof data.tags === 'string' 
          ? data.tags.split(',').map((tag: string) => tag.trim()) 
          : data.tags
      };
      
      // Set uploading state
      setUploading(true);
      
      // If the user wants to remove the existing image
      if (removeExistingImage && initialData?.image_url && initialData.image_url.includes('supabase')) {
        try {
          // Extract the file path from the URL
          const url = new URL(initialData.image_url);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(3).join('/');
          
          // Remove the file from storage
          await supabase.storage
            .from('project_images')
            .remove([filePath]);
            
          // Set image_url to null
          formattedData.image_url = null;
        } catch (error) {
          console.error("Error removing image from storage:", error);
          // Continue with form submit even if image deletion fails
        }
      }
      
      // If there's a new image to upload
      if (imageFile) {
        try {
          // If replacing an existing image, try to delete the old one first
          if (initialData?.image_url && initialData.image_url.includes('supabase')) {
            try {
              const url = new URL(initialData.image_url);
              const pathParts = url.pathname.split('/');
              const filePath = pathParts.slice(3).join('/');
              
              await supabase.storage
                .from('project_images')
                .remove([filePath]);
            } catch (error) {
              console.error("Error removing old image:", error);
              // Continue with upload even if old image deletion fails
            }
          }
          
          // Generate a unique file path
          const filePath = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9-_.]/g, '_')}`;
          
          // Upload the file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project_images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            throw uploadError;
          }
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('project_images')
            .getPublicUrl(filePath);
            
          // Add the image URL to the form data
          formattedData.image_url = publicUrl;
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Warning",
            description: "Failed to upload image, but project data will be saved",
            variant: "default"
          });
        }
      } else if (initialData?.image_url && !removeExistingImage) {
        // Keep existing image if no new one was uploaded and not removing
        formattedData.image_url = initialData.image_url;
      }
      
      // Submit the form data
      onSubmit(formattedData);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing your request",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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

        {/* Image Upload Field */}
        <FormItem>
          <FormLabel>Project Image</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
              {(imagePreview || (initialData?.image_url && !removeExistingImage)) && (
                <div className="mt-2 relative w-full h-40 rounded overflow-hidden border border-border">
                  <img 
                    src={imagePreview || initialData?.image_url || ''} 
                    alt="Project preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full" 
                    onClick={handleRemoveImage}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage>Upload a screenshot or image for your project</FormMessage>
        </FormItem>

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
                  onChange={(e) => field.onChange(e.target.value)}
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
                    {project.image_url && (
                      <div className="w-full h-32 overflow-hidden">
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
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
