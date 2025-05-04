-- Create the journey_content table
CREATE TABLE IF NOT EXISTS journey_content (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row-level security policies
ALTER TABLE journey_content ENABLE ROW LEVEL SECURITY;

-- Create policies
-- 1. Anyone can read journey content
CREATE POLICY "Journey content is viewable by everyone" 
ON journey_content FOR SELECT 
USING (true);

-- 2. Users can insert their own journey content
CREATE POLICY "Users can insert their own journey content" 
ON journey_content FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Users can update their own journey content
CREATE POLICY "Users can update their own journey content" 
ON journey_content FOR UPDATE 
USING (auth.uid() = id);

-- 4. Users can delete their own journey content
CREATE POLICY "Users can delete their own journey content" 
ON journey_content FOR DELETE 
USING (auth.uid() = id);