import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface ManageJourneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JourneyContent {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const journeySchema = z.object({
  content: z
    .string()
    .min(10, "Journey content must be at least 10 characters")
    .max(1500, "Journey content must be less than 1500 characters"),
});

type FormValues = z.infer<typeof journeySchema>;

const ManageJourneyDialog = ({ open, onOpenChange }: ManageJourneyDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(journeySchema),
    defaultValues: {
      content: "",
    },
  });

  // Fetch journey content data
  useEffect(() => {
    if (open && user) {
      fetchJourneyContent();
    }
  }, [open, user]);

  const fetchJourneyContent = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journey_content')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      if (data) {
        form.reset({
          content: data.content || "",
        });
      } else {
        // Set default values if no data exists yet
        form.reset({
          content: "I'm a passionate full-stack developer with over 8 years of experience building web applications that solve real-world problems. My journey in web development began when I built my first website at the age of 14, and I've been hooked ever since.\n\nI specialize in building modern, responsive, and accessible web applications using the latest technologies. I'm constantly learning and exploring new technologies to stay at the forefront of web development.\n\nWhen I'm not coding, you can find me hiking, reading science fiction, or experimenting with new recipes in the kitchen. I believe in writing clean, maintainable code and enjoy mentoring other developers.",
        });
      }
    } catch (error) {
      console.error('Error fetching journey content:', error);
      toast({
        title: "Error",
        description: "Failed to load journey content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const updates = {
        id: user.id,
        ...values,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('journey_content')
        .upsert(updates);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Journey content updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating journey content:', error);
      toast({
        title: "Error",
        description: "Failed to update journey content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Journey</DialogTitle>
          <DialogDescription>
            Update the "My Journey" section displayed on your About page.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>My Journey Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your professional journey, skills, and personal interests..." 
                      className="min-h-[300px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ManageJourneyDialog;