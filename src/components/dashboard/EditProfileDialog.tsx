import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Profile {
  id: string;
  name: string | null;
  bio: string | null;
  headline: string | null;
  description: string | null;
  avatar_url: string | null;
}

const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'profile_avatars');
    
    if (bucketIndex !== -1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    } else {
      return pathParts.slice(3).join('/');
    }
  } catch (error) {
    console.error("Failed to extract file path from URL:", error);
    return null;
  }
};

const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl || !imageUrl.includes('supabase')) return false;
  
  try {
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) return false;
    
    console.log("Attempting to delete file:", filePath);
    
    const { error, data } = await supabase.storage
      .from('profile_avatars')
      .remove([filePath]);
    
    if (error) {
      console.error("Error deleting file from storage:", error);
      return false;
    }
    
    console.log("File deletion result:", data);
    return true;
  } catch (error) {
    console.error("Failed to delete image from storage:", error);
    return false;
  }
};

const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeExistingAvatar, setRemoveExistingAvatar] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchProfile();
    }
  }, [open, user]);

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
        setName(data.name || '');
        setBio(data.bio || '');
        setHeadline(data.headline || 'I build things for the web');
        setDescription(data.description || 'A passionate developer focused on creating interactive, accessible, and responsive web applications');
        setAvatarPreview(data.avatar_url);
        setRemoveExistingAvatar(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setRemoveExistingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setRemoveExistingAvatar(true);
    setAvatarPreview(null);
    setAvatarFile(null);
    
    toast({
      title: "Avatar removed",
      description: "Your avatar will be removed when you save changes",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setLoading(true);
      setUploading(true);
      
      let avatarUrl = profile?.avatar_url;
      
      if (removeExistingAvatar && profile?.avatar_url) {
        const deletionSuccess = await deleteImageFromStorage(profile.avatar_url);
        if (deletionSuccess) {
          console.log("Successfully deleted avatar image");
          avatarUrl = null;
        } else {
          console.error("Failed to delete avatar from storage");
        }
      }
      
      if (avatarFile) {
        try {
          if (profile?.avatar_url) {
            await deleteImageFromStorage(profile.avatar_url);
          }
          
          const filePath = `${user.id}/${Date.now()}_${avatarFile.name.replace(/[^a-zA-Z0-9-_.]/g, '_')}`;
          console.log("Uploading avatar to path:", filePath);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile_avatars')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error("Error uploading avatar:", uploadError);
            throw uploadError;
          }
          
          console.log("Upload successful:", uploadData);
          
          const { data: { publicUrl } } = supabase.storage
            .from('profile_avatars')
            .getPublicUrl(filePath);
            
          console.log("Generated public URL:", publicUrl);
          
          avatarUrl = publicUrl;
        } catch (error) {
          console.error("Error uploading avatar:", error);
          toast({
            title: "Warning",
            description: "Failed to upload avatar, but profile data will be saved",
            variant: "default"
          });
        }
      }
      
      const updates = {
        id: user.id,
        name,
        bio,
        headline,
        description,
        avatar_url: avatarUrl,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex flex-col items-center space-y-4">
              {(avatarPreview && !removeExistingAvatar) ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border">
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button 
                    type="button"
                    variant="destructive" 
                    size="icon"
                    className="absolute top-0 right-0 h-6 w-6 rounded-full" 
                    onClick={handleRemoveAvatar}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    <span className="sr-only">Remove avatar</span>
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-muted-foreground">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
              
              <div className="flex flex-col w-full">
                <Input 
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a profile picture (JPG, PNG, GIF only)
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Title</Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Full-Stack Developer"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              This appears at the top of your homepage
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Textarea
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. I build things for the web"
              disabled={loading}
              className="min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground">
              Your main headline in the hero section
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Brief Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description about yourself and your work"
              disabled={loading}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              A brief description displayed on your homepage
            </p>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
