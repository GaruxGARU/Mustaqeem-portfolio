-- Add WhatsApp field to contact_messages table
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS whatsapp TEXT;
