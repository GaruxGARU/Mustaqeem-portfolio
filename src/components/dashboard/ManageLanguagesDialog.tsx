import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ManageLanguagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Language {
  id: string;
  user_id: string;
  language: string;
  proficiency: string;
  is_native: boolean;
  created_at: string;
  updated_at: string;
}

const proficiencyOptions = [
  { label: "Native", value: "Native" },
  { label: "Fluent", value: "Fluent" },
  { label: "Advanced", value: "Advanced" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Basic", value: "Basic" },
];

const languageSchema = z.object({
  language: z.string().min(1, "Language name is required"),
  proficiency: z.string().min(1, "Proficiency level is required"),
  is_native: z.boolean().default(false),
});

type FormValues = z.infer<typeof languageSchema>;

const ManageLanguagesDialog = ({ open, onOpenChange }: ManageLanguagesDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      language: "",
      proficiency: "",
      is_native: false,
    },
  });

  // Fetch languages data
  useEffect(() => {
    if (open && user) {
      fetchLanguages();
    }
  }, [open, user]);

  const fetchLanguages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('user_id', user.id)
        .order('is_native', { ascending: false })
        .order('language', { ascending: true });

      if (error) {
        throw error;
      }

      setLanguages(data || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast({
        title: "Error",
        description: "Failed to load languages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = () => {
    setIsEditing(true);
    if (currentLanguage) {
      form.reset({
        language: currentLanguage.language,
        proficiency: currentLanguage.proficiency,
        is_native: currentLanguage.is_native,
      });
    } else {
      form.reset({
        language: "",
        proficiency: "",
        is_native: false,
      });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (!user) return;

    try {
      setLoading(true);
      
      if (currentLanguage) {
        // Update existing language
        const { error } = await supabase
          .from('languages')
          .update({
            language: values.language,
            proficiency: values.proficiency,
            is_native: values.is_native,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentLanguage.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Language updated successfully",
        });
      } else {
        // Add new language
        const { error } = await supabase
          .from('languages')
          .insert({
            user_id: user.id,
            language: values.language,
            proficiency: values.proficiency,
            is_native: values.is_native,
          });

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Language added successfully",
        });
      }
      
      setIsEditing(false);
      setCurrentLanguage(null);
      fetchLanguages();
    } catch (error) {
      console.error('Error managing language:', error);
      toast({
        title: "Error",
        description: "Failed to save language",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (language: Language) => {
    setCurrentLanguage(language);
    setIsEditing(true);
    form.reset({
      language: language.language,
      proficiency: language.proficiency,
      is_native: language.is_native,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this language?")) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('languages')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Language deleted successfully",
      });
      
      fetchLanguages();
    } catch (error) {
      console.error('Error deleting language:', error);
      toast({
        title: "Error",
        description: "Failed to delete language",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentLanguage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Languages</DialogTitle>
          <DialogDescription>
            Add languages you speak and your proficiency level.
          </DialogDescription>
        </DialogHeader>
        
        {!isEditing ? (
          <>
            <div className="space-y-4 py-4">
              {languages.length > 0 ? (
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <Card key={lang.id} className="border border-secondary">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium flex items-center">
                            {lang.language}
                            {lang.is_native && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
                                Native
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lang.proficiency}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(lang)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(lang.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  You haven't added any languages yet.
                </div>
              )}
              
              <Button
                className="w-full"
                onClick={handleAddEdit}
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Language
              </Button>
            </div>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. English, Spanish, French" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="proficiency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proficiency Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select proficiency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proficiencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_native"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-input p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Native Speaker</FormLabel>
                      <FormDescription>
                        Mark this language as your native language
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
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : (currentLanguage ? "Update" : "Add")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageLanguagesDialog;