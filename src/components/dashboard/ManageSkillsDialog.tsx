
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
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Skill
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
                              <CardTitle className="text-base">{skill.name}</CardTitle>
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
