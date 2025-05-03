import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface ManageWorkExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WorkExperience {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

const WorkExperienceForm = ({ 
  onSubmit, 
  initialData = null, 
  onCancel 
}: { 
  onSubmit: (data: any) => void;
  initialData?: WorkExperience | null;
  onCancel: () => void;
}) => {
  const form = useForm({
    defaultValues: initialData || {
      title: '',
      organization: '',
      period: '',
      description: '',
      tags: ''
    }
  });

  // Convert tags array to string for form display
  useEffect(() => {
    if (initialData && Array.isArray(initialData.tags)) {
      form.setValue('tags', initialData.tags.join(', '));
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Senior Front-end Developer" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company/Organization</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Tech Innovators Inc." />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period</FormLabel>
              <FormControl>
                <Input {...field} placeholder="2021 - Present" />
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
                <Textarea {...field} placeholder="Describe your responsibilities and achievements" rows={4} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills/Technologies (comma separated)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="React, TypeScript, Node.js" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Experience
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ManageWorkExperienceDialog = ({ open, onOpenChange }: ManageWorkExperienceDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<WorkExperience | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchExperiences();
    }
  }, [open, user]);

  const fetchExperiences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching work experiences:', error);
      toast({
        title: "Error",
        description: "Failed to load work experiences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExperience = async (data: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Convert comma-separated tags to array
      const tags = data.tags
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      const newExperience = {
        ...data,
        tags,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('work_experience')
        .insert([newExperience]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Work experience added successfully",
      });
      
      setIsEditing(false);
      fetchExperiences();
    } catch (error) {
      console.error('Error creating work experience:', error);
      toast({
        title: "Error",
        description: "Failed to add work experience",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExperience = async (data: any) => {
    if (!user || !currentExperience) return;

    try {
      setLoading(true);
      
      // Convert comma-separated tags to array
      const tags = data.tags
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      const updates = {
        ...data,
        tags,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('work_experience')
        .update(updates)
        .eq('id', currentExperience.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Work experience updated successfully",
      });
      
      setIsEditing(false);
      setCurrentExperience(null);
      fetchExperiences();
    } catch (error) {
      console.error('Error updating work experience:', error);
      toast({
        title: "Error",
        description: "Failed to update work experience",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!user) return;

    if (!window.confirm("Are you sure you want to delete this work experience?")) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('work_experience')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Work experience deleted successfully",
      });
      
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting work experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete work experience",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: any) => {
    if (currentExperience) {
      handleUpdateExperience(data);
    } else {
      handleCreateExperience(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Work Experience</DialogTitle>
          <DialogDescription>
            Add, update, or remove your professional work experiences.
          </DialogDescription>
        </DialogHeader>
        
        {loading && !isEditing ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : isEditing ? (
          <WorkExperienceForm 
            onSubmit={handleSubmit}
            initialData={currentExperience}
            onCancel={() => {
              setIsEditing(false);
              setCurrentExperience(null);
            }}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Experience
              </Button>
            </div>
            
            {experiences.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No work experiences found. Add your first position!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {experiences.map((experience) => (
                  <Card key={experience.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{experience.title}</CardTitle>
                          <p className="text-sm text-primary">{experience.organization}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setCurrentExperience(experience);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteExperience(experience.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-1">
                      <p className="text-xs text-muted-foreground">{experience.period}</p>
                      <p className="text-sm mt-2 line-clamp-3">{experience.description}</p>
                    </CardContent>
                    {experience.tags && experience.tags.length > 0 && (
                      <CardFooter className="pt-0 pb-4 flex flex-wrap gap-1">
                        {experience.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-secondary/30 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </CardFooter>
                    )}
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

export default ManageWorkExperienceDialog;