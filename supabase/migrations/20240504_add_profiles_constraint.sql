-- Add a unique constraint to the profiles table to prevent duplicate entries
-- First, make sure any existing duplicates are removed (you've already done this manually)

-- Add the constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_key UNIQUE (id);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT profiles_id_key ON public.profiles 
IS 'Ensures each user can only have one profile record';