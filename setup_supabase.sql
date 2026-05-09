-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    headline TEXT,
    email TEXT,
    website TEXT,
    github TEXT,
    linkedin TEXT,
    summary TEXT,
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read (for this public demo)
-- In a real app, you would restrict this to authenticated users
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Create policy to allow anyone to insert (for this public demo)
CREATE POLICY "Anyone can insert a profile" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to update (for this public demo)
CREATE POLICY "Anyone can update a profile" ON public.profiles
    FOR UPDATE USING (true);
