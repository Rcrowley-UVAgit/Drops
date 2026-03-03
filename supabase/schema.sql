-- ============================================
-- DROPS V1 — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users (extends Supabase Auth)
-- ============================================
-- We store additional profile info here.
-- Supabase Auth handles id, email, etc.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Groups
-- ============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 6),
  drop_time TIME NOT NULL DEFAULT '12:00:00',
  cycle_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  cycle_index INT NOT NULL DEFAULT 0,
  streak_count INT NOT NULL DEFAULT 0,
  streak_last_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Group Members
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- Songs
-- ============================================
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  album_art_url TEXT,
  spotify_track_id TEXT UNIQUE,
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Drops
-- ============================================
CREATE TABLE IF NOT EXISTS public.drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  song_id UUID NOT NULL REFERENCES public.songs(id),
  caption TEXT CHECK (char_length(caption) <= 140),
  mood_tag TEXT CHECK (mood_tag IN ('Hype', 'Reflective', 'Late Night', 'Feel Good', 'Heartbreak', 'Energy')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  drop_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(group_id, drop_date) -- one drop per group per day
);

-- ============================================
-- Reactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('listening', 'adding', 'repeat', 'new', 'classic')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(drop_id, user_id, reaction_type)
);

-- ============================================
-- Comments
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  body TEXT NOT NULL CHECK (char_length(body) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Groups: members can read their groups
CREATE POLICY "Group members can view group" ON public.groups FOR SELECT
  USING (id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Group admins can update" ON public.groups FOR UPDATE
  USING (id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid() AND role = 'admin'));

-- Group members: readable by group members, insertable by authenticated users
CREATE POLICY "Group members visible to group" ON public.group_members FOR SELECT
  USING (group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can join groups" ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Songs: readable by all authenticated, insertable by authenticated
CREATE POLICY "Songs are viewable" ON public.songs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert songs" ON public.songs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Drops: readable by group members, insertable by the selected user
CREATE POLICY "Drops visible to group members" ON public.drops FOR SELECT
  USING (group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create drops" ON public.drops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reactions: readable by group members, insertable/deletable by authenticated
CREATE POLICY "Reactions visible to group" ON public.reactions FOR SELECT
  USING (drop_id IN (SELECT id FROM public.drops WHERE group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())));
CREATE POLICY "Users can react" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Comments: readable by group members, insertable by authenticated
CREATE POLICY "Comments visible to group" ON public.comments FOR SELECT
  USING (drop_id IN (SELECT id FROM public.drops WHERE group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid())));
CREATE POLICY "Users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.drops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_drops_group_date ON public.drops(group_id, drop_date DESC);
CREATE INDEX IF NOT EXISTS idx_drops_user ON public.drops(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_drop ON public.reactions(drop_id);
CREATE INDEX IF NOT EXISTS idx_comments_drop ON public.comments(drop_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_spotify ON public.songs(spotify_track_id);
