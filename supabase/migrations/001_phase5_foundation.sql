-- Phase 5 PR #1: Schema Foundation + Auth Core
-- Run this migration in your Supabase dashboard (SQL Editor) before applying code changes
--
-- Design: Option B (junction table) for player ↔ user linking
-- A user can have multiple player records across different teams/squads

-- Update squad_category enum to include all age categories used by the app
-- Approach: rename old type, create new type with all values, update column, drop old type
ALTER TYPE squad_category RENAME TO squad_category_old;
CREATE TYPE squad_category AS ENUM ('sub_13', 'sub_15', 'sub_17', 'sub_20', 'sub_23', 'absolute', 'senior', 'femenino', 'libre', 'amateur', 'professional', 'custom');
ALTER TABLE squads ALTER COLUMN category TYPE squad_category USING category::text::squad_category;
DROP TYPE squad_category_old;

-- User-Players junction table (replaces direct players.user_id FK)
CREATE TABLE IF NOT EXISTS user_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  player_id UUID NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, player_id)
);

-- Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for new tables
ALTER TABLE user_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies: user_players
CREATE POLICY "Users can view own user_players"
  ON user_players FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own user_players"
  ON user_players FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies: team_members
CREATE POLICY "Team members can view own membership"
  ON team_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Team owners can manage team_members"
  ON team_members FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()));

-- RLS policies: team_invitations
CREATE POLICY "Team owners can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view own pending invitations"
  ON team_invitations FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE email = team_invitations.email));

-- RLS policies: notifications
CREATE POLICY "Users manage own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
