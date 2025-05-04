import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

interface ManagePersonalInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PersonalInfo {
  id: string;
  full_name: string | null;
  location: string | null;
  email: string | null;
  available_for: string[] | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  created_at: string;
  updated_at: string;
}

const availableForOptions = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Freelance", value: "Freelance" },
  { label: "Contract", value: "Contract" },
  { label: "Internship", value: "Internship" },
];

const personalInfoSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  location: z.string().min(1, "Location is required"),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  available_for: z.array(z.string()).min(1, "Select at least one option"),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof personalInfoSchema>;

const ManagePersonalInfoDialog = ({ open, onOpenChange }: ManagePersonalInfoDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: "",
      location: "",
      email: "",
      available_for: [], // Initialize with empty array
      phone: "",
      whatsapp: "",
      website: "",
      github: "",
      linkedin: "",
    },
  });

  // Fetch personal info data
  useEffect(() => {
    if (open && user) {
      fetchPersonalInfo();
    }
  }, [open, user]);

  const fetchPersonalInfo = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      if (data) {
        // Handle the PostgreSQL text[] type properly
        // PostgreSQL text[] will be returned as a JavaScript array by Supabase client
        const availableFor = Array.isArray(data.available_for) ? data.available_for : [];
        
        form.reset({
          full_name: data.full_name || "",
          location: data.location || "",
          email: data.email || "",
          available_for: availableFor,
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          website: data.website || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        });
      }
    } catch (error) {
      console.error('Error fetching personal info:', error);
      toast({
        title: "Error",
        description: "Failed to load personal information",
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
      
      // Ensure available_for is properly formatted for PostgreSQL text[]
      const updates = {
        id: user.id,
        ...values,
        // No need for JSON.stringify with PostgreSQL text[] type
        // Supabase client will handle the conversion automatically
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('personal_info')
        .upsert(updates);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personal Information</DialogTitle>
          <DialogDescription>
            Update your personal information that will be displayed on your portfolio.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <Input placeholder="San Francisco, CA" {...field} />
                  </FormControl>
                  <FormDescription>City, Country or Remote</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormDescription>Public contact email for your portfolio</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="available_for"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available For</FormLabel>
                  <FormDescription>What type of work are you available for?</FormDescription>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableForOptions.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const updatedValue = checked
                                ? [...field.value, option.value]
                                : field.value.filter((value: string) => value !== option.value);
                              field.onChange(updatedValue);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1234567890" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Use international format without spaces
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/username" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/username" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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

export default ManagePersonalInfoDialog;