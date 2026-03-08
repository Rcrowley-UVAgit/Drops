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
  color TEXT DEFAULT '#BF6B4A',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''), ''));
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

-- ============================================
-- Additional RLS for anonymous auth
-- ============================================
-- Allow anonymous users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow groups to be read by invite code (for join flow)
CREATE POLICY "Anyone can read groups by invite code" ON public.groups FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- Device Tokens (for push notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'ios' CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens" ON public.device_tokens FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tokens" ON public.device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tokens" ON public.device_tokens FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON public.device_tokens(user_id);

-- ============================================
-- Notify on new drop (triggers edge function)
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_new_drop()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-drop-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'drop_id', NEW.id,
      'group_id', NEW.group_id,
      'user_id', NEW.user_id,
      'song_id', NEW.song_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: This trigger requires the pg_net extension (enabled by default on Supabase).
-- If you get an error about net.http_post, enable it: CREATE EXTENSION IF NOT EXISTS pg_net;
-- Alternatively, call the edge function from the client after submitDrop.
-- DROP TRIGGER IF EXISTS on_new_drop ON public.drops;
-- CREATE TRIGGER on_new_drop
--   AFTER INSERT ON public.drops
--   FOR EACH ROW EXECUTE FUNCTION public.notify_new_drop();

-- ============================================
-- Join Group RPC (called from client on sign-up)
-- ============================================
CREATE OR REPLACE FUNCTION public.join_group_with_code(
  p_invite_code TEXT,
  p_display_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_group_name TEXT;
  v_cycle_order JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  -- Find group by invite code
  SELECT id, name, cycle_order INTO v_group_id, v_group_name, v_cycle_order
  FROM public.groups
  WHERE invite_code = UPPER(TRIM(p_invite_code));

  IF v_group_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Invalid invite code');
  END IF;

  -- Upsert profile with display name
  INSERT INTO public.profiles (id, display_name)
  VALUES (v_user_id, TRIM(p_display_name))
  ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

  -- Join group (ignore if already a member)
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'member')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  -- Add to cycle_order if not already present
  IF NOT (v_cycle_order @> to_jsonb(v_user_id::text)) THEN
    UPDATE public.groups
    SET cycle_order = cycle_order || to_jsonb(v_user_id::text)
    WHERE id = v_group_id;
  END IF;

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'group_id', v_group_id,
    'group_name', v_group_name
  );
END;
$$;

-- ============================================
-- Seed Data: UW Lads group
-- ============================================
-- Run after deploying schema:
-- INSERT INTO public.groups (name, invite_code) VALUES ('UW Lads', 'UWLADS2026');
