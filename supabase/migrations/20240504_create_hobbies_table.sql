-- Create the hobbies table
CREATE TABLE IF NOT EXISTS public.hobbies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own hobbies"
ON public.hobbies
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hobbies"
ON public.hobbies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hobbies"
ON public.hobbies
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hobbies"
ON public.hobbies
FOR DELETE
USING (auth.uid() = user_id);

-- Add a policy to allow public viewing
CREATE POLICY "Hobbies are viewable by everyone"
ON public.hobbies
FOR SELECT
USING (true);