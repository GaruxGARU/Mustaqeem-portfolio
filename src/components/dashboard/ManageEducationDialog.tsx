import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from '@/components/ui/switch';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ManageEducationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Education {
  id: string;
  title: string;
  organization: string;
  period?: string;
  description: string;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // New fields
  institution_name?: string;
  degree?: string;
  start_date?: string;
  end_date?: string | null;
  current?: boolean;
  location?: string | null;
}

// Define a schema for form validation
const educationFormSchema = z.object({
  title: z.string().min(1, "Degree/Certificate is required"),
  institution_name: z.string().min(1, "Institution name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable(),
  current: z.boolean().default(false),
  description: z.string(),
  location: z.string().nullable(),
  tags: z.string()
});

// Create a type from the schema
type EducationFormValues = z.infer<typeof educationFormSchema>;

const EducationForm = ({ 
  onSubmit, 
  initialData = null, 
  onCancel 
}: { 
  onSubmit: (data: EducationFormValues) => void;
  initialData?: Education | null;
  onCancel: () => void;
}) => {
  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      title: initialData?.title || initialData?.degree || '',
      institution_name: initialData?.institution_name || initialData?.organization || '',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || null,
      current: initialData?.current || false,
      description: initialData?.description || '',
      location: initialData?.location || '',
      tags: initialData?.tags ? initialData.tags.join(', ') : ''
    }
  });

  // Watch current value to toggle end_date field
  const isCurrent = form.watch("current");

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
          name="institution_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution</FormLabel>
              <FormControl>
                <Input {...field} placeholder="University of Technology" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isCurrent}
                      >
                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="current"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Current Program</FormLabel>
                <FormDescription>
                  I'm currently studying here
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

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="City, Country" />
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

  const handleCreateEducation = async (data: EducationFormValues) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Convert comma-separated tags to array
      const tags = data.tags
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      const newEducation = {
        title: data.title,
        institution_name: data.institution_name,
        organization: data.institution_name, // For backward compatibility
        degree: data.title, // For backward compatibility
        start_date: data.start_date,
        end_date: data.current ? null : data.end_date,
        current: data.current,
        description: data.description,
        location: data.location,
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

  const handleUpdateEducation = async (data: EducationFormValues) => {
    if (!user || !currentEducation) return;

    try {
      setLoading(true);
      
      // Convert comma-separated tags to array
      const tags = data.tags
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];
      
      const updates = {
        title: data.title,
        institution_name: data.institution_name,
        organization: data.institution_name, // For backward compatibility
        degree: data.title, // For backward compatibility
        start_date: data.start_date,
        end_date: data.current ? null : data.end_date,
        current: data.current,
        description: data.description,
        location: data.location, 
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

  const handleSubmit = (data: EducationFormValues) => {
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
                          <p className="text-sm text-primary">{education.institution_name || education.organization}</p>
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
                      <p className="text-xs text-muted-foreground">
                        {education.start_date && format(new Date(education.start_date), "PPP")}
                        {education.end_date ? ` - ${format(new Date(education.end_date), "PPP")}` : education.current ? " - Present" : ""}
                      </p>
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