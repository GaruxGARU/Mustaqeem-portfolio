-- Add headline and description fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS headline TEXT DEFAULT 'I build things for the web',
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT 'A passionate developer focused on creating interactive, accessible, and responsive web applications';

COMMENT ON COLUMN public.profiles.headline IS 'Main headline displayed on hero section';
COMMENT ON COLUMN public.profiles.description IS 'Brief description displayed on hero section';