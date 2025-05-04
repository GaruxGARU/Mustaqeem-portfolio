-- Create personal_info table
CREATE TABLE IF NOT EXISTS public.personal_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    location TEXT,
    github TEXT,
    linkedin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a unique constraint to ensure only one personal_info record per user
ALTER TABLE public.personal_info ADD CONSTRAINT personal_info_user_id_key UNIQUE (user_id);

-- Set up RLS (Row Level Security)
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own personal_info
CREATE POLICY "Users can view their own personal info" 
  ON public.personal_info 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert/update their own personal_info
CREATE POLICY "Users can insert their own personal info" 
  ON public.personal_info 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal info" 
  ON public.personal_info 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow anyone to view any personal_info (for public portfolio display)
CREATE POLICY "Anyone can view any personal info" 
  ON public.personal_info 
  FOR SELECT 
  USING (true);

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_personal_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personal_info_updated_at
BEFORE UPDATE ON public.personal_info
FOR EACH ROW
EXECUTE FUNCTION update_personal_info_updated_at();

-- Create contact_messages table for storing form submissions
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a contact message
CREATE POLICY "Anyone can submit a contact message" 
  ON public.contact_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated users can view messages
CREATE POLICY "Only authenticated users can view contact messages" 
  ON public.contact_messages 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only authenticated users can update messages (e.g., mark as read)
CREATE POLICY "Only authenticated users can update contact messages" 
  ON public.contact_messages 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');