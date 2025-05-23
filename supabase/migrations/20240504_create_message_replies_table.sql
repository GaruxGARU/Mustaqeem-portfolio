-- Create message_replies table for storing email replies
CREATE TABLE IF NOT EXISTS public.message_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    replied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    replied_by TEXT, -- Email address used to send the reply
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security) for message_replies
ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert/view/update message replies
CREATE POLICY "Only authenticated users can insert message replies" 
  ON public.message_replies 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can view message replies" 
  ON public.message_replies 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create an index on message_id for faster lookups
CREATE INDEX IF NOT EXISTS message_replies_message_id_idx ON public.message_replies (message_id);
