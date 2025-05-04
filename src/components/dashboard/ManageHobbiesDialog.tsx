import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Edit, Trash, Check,
  Camera, Music, Book, Code, Film, Gamepad2, Palette, 
  Bike, Utensils, Dumbbell, GraduationCap, Heart, 
  Plane, Coffee, PlaneTakeoff, Laptop, Mountain, Tv, Globe, Flower2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Create a map of common hobby icons
const hobbyIcons = [
  { name: 'camera', icon: Camera, label: 'Photography' },
  { name: 'music', icon: Music, label: 'Music' },
  { name: 'book', icon: Book, label: 'Reading' },
  { name: 'code', icon: Code, label: 'Coding' },
  { name: 'film', icon: Film, label: 'Movies & Cinema' },
  { name: 'gamepad2', icon: Gamepad2, label: 'Gaming' },
  { name: 'palette', icon: Palette, label: 'Art & Drawing' },
  { name: 'bike', icon: Bike, label: 'Cycling' },
  { name: 'utensils', icon: Utensils, label: 'Cooking' },
  { name: 'dumbbell', icon: Dumbbell, label: 'Fitness' },
  { name: 'graduationCap', icon: GraduationCap, label: 'Learning' },
  { name: 'heart', icon: Heart, label: 'Volunteering' },
  { name: 'plane', icon: Plane, label: 'Travel' },
  { name: 'coffee', icon: Coffee, label: 'Coffee' },
  { name: 'planeTakeoff', icon: PlaneTakeoff, label: 'Travel' },
  { name: 'laptop', icon: Laptop, label: 'Technology' },
  { name: 'mountain', icon: Mountain, label: 'Hiking' },
  { name: 'tv', icon: Tv, label: 'TV Shows' },
  { name: 'globe', icon: Globe, label: 'Languages' },
  { name: 'flower2', icon: Flower2, label: 'Gardening' },
];

// Icon Selector Component
interface IconSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

const IconSelector = ({ value, onChange }: IconSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Find the selected icon
  const selectedIcon = hobbyIcons.find(icon => icon.name === value);
  const IconComponent = selectedIcon?.icon;
  
  // Filter icons based on search term
  const filteredIcons = searchTerm 
    ? hobbyIcons.filter(icon => 
        icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : hobbyIcons;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {value ? (
              <>
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span>{selectedIcon?.label || value}</span>
              </>
            ) : (
              "Select an icon"
            )}
          </div>
          <Plus className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-3" 
        side="top" 
        align="start"
        sideOffset={5}
        alignOffset={0}
      >
        <div className="space-y-3">
          <Input 
            placeholder="Search icons..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {filteredIcons.length === 0 ? (
            <div className="text-center py-2 text-muted-foreground">No icons found</div>
          ) : (
            <div 
              className="max-h-[240px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-muted-foreground/10"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-3 gap-1 py-1">
                {filteredIcons.map((icon) => {
                  const IconComp = icon.icon;
                  const isSelected = value === icon.name;
                  
                  return (
                    <Button
                      key={icon.name}
                      type="button" 
                      variant={isSelected ? "default" : "outline"}
                      className={`flex flex-col items-center justify-center h-[64px] p-1 gap-1 ${isSelected ? "border-primary" : ""}`}
                      onClick={() => {
                        onChange(icon.name);
                        setOpen(false);
                      }}
                    >
                      <IconComp className="h-5 w-5" />
                      <span className="text-xs truncate w-full text-center">{icon.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ManageHobbiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Hobby {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

// Validation schema for hobby form
const hobbySchema = z.object({
  name: z.string().min(1, "Hobby name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

type HobbyFormValues = z.infer<typeof hobbySchema>;

const HobbyForm = ({ 
  onSubmit, 
  initialData = null, 
  onCancel 
}: { 
  onSubmit: (data: HobbyFormValues) => void;
  initialData?: Hobby | null;
  onCancel: () => void;
}) => {
  const form = useForm<HobbyFormValues>({
    resolver: zodResolver(hobbySchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      icon: '',
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
              <FormLabel>Hobby Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Photography" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Tell more about this hobby or interest" 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Optional)</FormLabel>
              <FormControl>
                <IconSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>
                Select an icon that represents your hobby.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Hobby
          </Button>
        </div>
      </form>
    </Form>
  );
};

const ManageHobbiesDialog = ({ open, onOpenChange }: ManageHobbiesDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentHobby, setCurrentHobby] = useState<Hobby | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchHobbies();
    }
  }, [open, user]);

  const fetchHobbies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hobbies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setHobbies(data || []);
    } catch (error) {
      console.error('Error fetching hobbies:', error);
      toast({
        title: "Error",
        description: "Failed to load hobbies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHobby = async (data: HobbyFormValues) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const newHobby = {
        ...data,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('hobbies')
        .insert([newHobby]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Hobby created successfully",
      });
      
      setIsEditing(false);
      fetchHobbies();
    } catch (error) {
      console.error('Error creating hobby:', error);
      toast({
        title: "Error",
        description: "Failed to create hobby",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHobby = async (data: HobbyFormValues) => {
    if (!user || !currentHobby) return;

    try {
      setLoading(true);
      
      const updates = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('hobbies')
        .update(updates)
        .eq('id', currentHobby.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Hobby updated successfully",
      });
      
      setIsEditing(false);
      setCurrentHobby(null);
      fetchHobbies();
    } catch (error) {
      console.error('Error updating hobby:', error);
      toast({
        title: "Error",
        description: "Failed to update hobby",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHobby = async (id: string) => {
    if (!user) return;

    if (!window.confirm("Are you sure you want to delete this hobby?")) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('hobbies')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Hobby deleted successfully",
      });
      
      fetchHobbies();
    } catch (error) {
      console.error('Error deleting hobby:', error);
      toast({
        title: "Error",
        description: "Failed to delete hobby",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: HobbyFormValues) => {
    if (currentHobby) {
      handleUpdateHobby(data);
    } else {
      handleCreateHobby(data);
    }
  };

  // Function to get the appropriate icon component
  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return null;
    
    try {
      const selectedIcon = hobbyIcons.find(icon => icon.name === iconName);
      const IconComponent = selectedIcon?.icon;
      return IconComponent ? (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
          <IconComponent className="h-6 w-6" />
        </div>
      ) : null;
    } catch (error) {
      console.error(`Error loading icon: ${iconName}`, error);
      return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Interests & Hobbies</DialogTitle>
          <DialogDescription>
            Add your personal interests and hobbies to showcase on your portfolio.
          </DialogDescription>
        </DialogHeader>
        
        {loading && !isEditing ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : isEditing ? (
          <HobbyForm 
            onSubmit={handleSubmit}
            initialData={currentHobby}
            onCancel={() => {
              setIsEditing(false);
              setCurrentHobby(null);
            }}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Hobby
              </Button>
            </div>
            
            {hobbies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hobbies found. Add your first hobby!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {hobbies.map((hobby) => (
                  <Card key={hobby.id} className="flex flex-col">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between">
                      <div className="flex items-center">
                        {hobby.icon && getIconComponent(hobby.icon)}
                        <CardTitle className="text-lg ml-2">{hobby.name}</CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setCurrentHobby(hobby);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteHobby(hobby.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {hobby.description && (
                      <CardContent className="py-2">
                        <p className="text-sm text-muted-foreground">
                          {hobby.description}
                        </p>
                      </CardContent>
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

export default ManageHobbiesDialog;