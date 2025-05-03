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

interface ManageEducationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Education {
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

const EducationForm = ({ 
  onSubmit, 
  initialData = null, 
  onCancel 
}: { 
  onSubmit: (data: any) => void;
  initialData?: Education | null;
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
              <FormLabel>Degree/Certificate</FormLabel>
              <FormControl>
                <Input {...field} placeholder="BSc in Computer Science" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution</FormLabel>
              <FormControl>
                <Input {...field} placeholder="University of Technology" />
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
                <Input {...field} placeholder="2018 - 2022" />
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
                <Textarea {...field} placeholder="Describe your studies, achievements, thesis, etc." rows={4} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subjects/Focus Areas (comma separated)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Web Development, Data Structures, Algorithms" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Education
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ManageEducationDialog = ({ open, onOpenChange }: ManageEducationDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [educationItems, setEducationItems] = useState<Education[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchEducation();
    }
  }, [open, user]);

  const fetchEducation = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setEducationItems(data || []);
    } catch (error) {
      console.error('Error fetching education:', error);
      toast({
        title: "Error",
        description: "Failed to load education items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEducation = async (data: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Convert comma-separated tags to array
      const tags = data.tags
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      const newEducation = {
        ...data,
        tags,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('education')
        .insert([newEducation]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Education item added successfully",
      });
      
      setIsEditing(false);
      fetchEducation();
    } catch (error) {
      console.error('Error creating education item:', error);
      toast({
        title: "Error",
        description: "Failed to add education item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEducation = async (data: any) => {
    if (!user || !currentEducation) return;

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
        .from('education')
        .update(updates)
        .eq('id', currentEducation.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Education item updated successfully",
      });
      
      setIsEditing(false);
      setCurrentEducation(null);
      fetchEducation();
    } catch (error) {
      console.error('Error updating education item:', error);
      toast({
        title: "Error",
        description: "Failed to update education item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!user) return;

    if (!window.confirm("Are you sure you want to delete this education item?")) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Education item deleted successfully",
      });
      
      fetchEducation();
    } catch (error) {
      console.error('Error deleting education item:', error);
      toast({
        title: "Error",
        description: "Failed to delete education item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: any) => {
    if (currentEducation) {
      handleUpdateEducation(data);
    } else {
      handleCreateEducation(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Education</DialogTitle>
          <DialogDescription>
            Add, update, or remove your educational background.
          </DialogDescription>
        </DialogHeader>
        
        {loading && !isEditing ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : isEditing ? (
          <EducationForm 
            onSubmit={handleSubmit}
            initialData={currentEducation}
            onCancel={() => {
              setIsEditing(false);
              setCurrentEducation(null);
            }}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Education
              </Button>
            </div>
            
            {educationItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No education items found. Add your educational background!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {educationItems.map((education) => (
                  <Card key={education.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{education.title}</CardTitle>
                          <p className="text-sm text-primary">{education.organization}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setCurrentEducation(education);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteEducation(education.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-1">
                      <p className="text-xs text-muted-foreground">{education.period}</p>
                      <p className="text-sm mt-2 line-clamp-3">{education.description}</p>
                    </CardContent>
                    {education.tags && education.tags.length > 0 && (
                      <CardFooter className="pt-0 pb-4 flex flex-wrap gap-1">
                        {education.tags.map((tag, index) => (
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

export default ManageEducationDialog;