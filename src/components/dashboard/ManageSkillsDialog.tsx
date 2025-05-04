import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Slider } from '@/components/ui/slider';

interface ManageSkillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  description: string | null;
  years: number | null;
  projects: number | null;
  created_at: string;
  updated_at: string;
  image_url: string | null;
}

const CATEGORIES = [
  "Programming Languages",
  "Frontend",
  "Backend",
  "Mobile",
  "DevOps",
  "Database",
  "Design",
  "Other"
];

const SkillForm = ({ 
  onSubmit, 
  initialData = null, 
  onCancel 
}: { 
  onSubmit: (data: any) => void;
  initialData?: Skill | null;
  onCancel: () => void;
}) => {
  const form = useForm({
    defaultValues: initialData || {
      name: '',
      category: 'Programming Languages',
      proficiency: 50,
      description: '',
      years: null,
      projects: null,
      image_url: null,
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
    // If we have an initial image (updating a skill) and it's from Supabase
    if (initialData?.image_url && initialData.image_url.includes('supabase')) {
      try {
        // Extract the file path from the URL
        const url = new URL(initialData.image_url);
        const pathParts = url.pathname.split('/');
        const bucketName = pathParts[2];
        const filePath = pathParts.slice(3).join('/');
        
        setRemoveExistingImage(true);
        setImagePreview(null);
        setImageFile(null);
        
        // We're not actually deleting here - that will happen when the form submits
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
      // Set uploading state
      setUploading(true);
      
      // If the user wants to remove the existing image
      if (removeExistingImage && initialData?.image_url) {
        try {
          // Extract the file path from the URL
          const url = new URL(initialData.image_url);
          const pathParts = url.pathname.split('/');
          const bucketName = pathParts[2];
          const filePath = pathParts.slice(3).join('/');
          
          // Remove the file from storage
          await supabase.storage
            .from('skill_images')
            .remove([filePath]);
            
          // Set image_url to null
          data.image_url = null;
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
                .from('skill_images')
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
            .from('skill_images')
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            throw uploadError;
          }
          
          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('skill_images')
            .getPublicUrl(filePath);
            
          // Add the image URL to the form data
          data.image_url = publicUrl;
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Warning",
            description: "Failed to upload image, but skill data will be saved",
            variant: "default"
          });
        }
      } else if (initialData?.image_url && !removeExistingImage) {
        // Keep existing image if no new one was uploaded and not removing
        data.image_url = initialData.image_url;
      }
      
      // Submit the form data
      onSubmit(data);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="React" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Image Upload Field */}
        <FormItem>
          <FormLabel>Skill Logo/Image</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2">
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
              {(imagePreview || (initialData?.image_url && !removeExistingImage)) && (
                <div className="mt-2 relative w-24 h-24 rounded overflow-hidden border border-border">
                  <img 
                    src={imagePreview || initialData?.image_url || ''} 
                    alt="Skill logo preview" 
                    className="w-full h-full object-contain"
                  />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6 rounded-full" 
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
          <FormMessage>Upload a logo or image for this skill (optional)</FormMessage>
        </FormItem>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proficiency"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Proficiency: {value}%</FormLabel>
              <FormControl>
                <Slider
                  {...fieldProps}
                  value={[value]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(vals) => onChange(vals[0])}
                  className="py-4"
                />
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
                <Textarea {...field} placeholder="Describe your experience with this skill" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="years"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input 
                    {...fieldProps}
                    type="number" 
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} 
                    placeholder="2"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projects"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Number of Projects</FormLabel>
                <FormControl>
                  <Input 
                    {...fieldProps}
                    type="number" 
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                    placeholder="5"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : initialData ? 'Update' : 'Create'} Skill
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ManageSkillsDialog = ({ open, onOpenChange }: ManageSkillsDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchSkills();
    }
  }, [open, user]);

  const fetchSkills = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true });

      if (error) {
        throw error;
      }

      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: "Error",
        description: "Failed to load skills",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (data: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const newSkill = {
        ...data,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('skills')
        .insert([newSkill]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Skill created successfully",
      });
      
      setIsEditing(false);
      fetchSkills();
    } catch (error) {
      console.error('Error creating skill:', error);
      toast({
        title: "Error",
        description: "Failed to create skill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async (data: any) => {
    if (!user || !currentSkill) return;

    try {
      setLoading(true);
      
      const updates = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', currentSkill.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Skill updated successfully",
      });
      
      setIsEditing(false);
      setCurrentSkill(null);
      fetchSkills();
    } catch (error) {
      console.error('Error updating skill:', error);
      toast({
        title: "Error",
        description: "Failed to update skill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!user) return;

    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
      
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: any) => {
    if (currentSkill) {
      handleUpdateSkill(data);
    } else {
      handleCreateSkill(data);
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((groups, skill) => {
    const category = skill.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(skill);
    return groups;
  }, {} as Record<string, Skill[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Skills</DialogTitle>
          <DialogDescription>
            Create, update, or remove your professional skills.
          </DialogDescription>
        </DialogHeader>
        
        {loading && !isEditing ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : isEditing ? (
          <SkillForm 
            onSubmit={handleSubmit}
            initialData={currentSkill}
            onCancel={() => {
              setIsEditing(false);
              setCurrentSkill(null);
            }}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Skill
              </Button>
            </div>
            
            {skills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No skills found. Add your first skill!</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium">{category}</h3>
                    <div className="space-y-2">
                      {categorySkills.map((skill) => (
                        <Card key={skill.id} className="overflow-hidden">
                          <div className="relative">
                            {/* Proficiency bar */}
                            <div 
                              className="absolute bottom-0 h-1 bg-primary transition-all" 
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                {skill.image_url && (
                                  <div className="h-8 w-8 rounded overflow-hidden bg-muted flex-shrink-0">
                                    <img 
                                      src={skill.image_url} 
                                      alt={skill.name}
                                      className="h-full w-full object-contain" 
                                    />
                                  </div>
                                )}
                                <CardTitle className="text-base">{skill.name}</CardTitle>
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setCurrentSkill(skill);
                                    setIsEditing(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteSkill(skill.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-1">
                            {skill.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {skill.description}
                              </p>
                            )}
                          </CardContent>
                          <CardFooter className="pt-0 text-xs text-muted-foreground">
                            <div className="flex space-x-4">
                              {skill.years !== null && (
                                <span>{skill.years} {skill.years === 1 ? 'year' : 'years'}</span>
                              )}
                              {skill.projects !== null && (
                                <span>{skill.projects} {skill.projects === 1 ? 'project' : 'projects'}</span>
                              )}
                              <span>{skill.proficiency}% proficiency</span>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageSkillsDialog;
