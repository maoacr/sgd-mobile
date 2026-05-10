-- =============================================================================
-- SGD — Schema Completo
-- Ejecutar TODO en SQL Editor de Supabase (un solo bloque)
-- =============================================================================

BEGIN;

-- 1. ENUMS
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('superadmin', 'admin_complejo', 'player', 'team', 'referee'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE tournament_status AS ENUM ('draft', 'active', 'finished', 'cancelled'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE tournament_type AS ENUM ('league', 'knockout', 'groups', 'mixed'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE tournament_category AS ENUM ('amateur', 'sub20', 'sub23', 'professional', 'custom'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE squad_category AS ENUM ('amateur', 'sub20', 'sub23', 'professional', 'custom'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE match_status AS ENUM ('scheduled', 'in_progress', 'finished', 'cancelled', 'postponed'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE match_event_type AS ENUM ('goal', 'own_goal', 'yellow_card', 'red_card', 'yellow_red_card', 'substitution', 'penalty_scored', 'penalty_missed'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE player_position AS ENUM ('goalkeeper', 'defender', 'midfielder', 'forward'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE tournament_team_status AS ENUM ('confirmed', 'pending'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE venue_type AS ENUM ('futsal', 'fut7', 'fut9', 'fut11'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE surface_type AS ENUM ('sintetica', 'híbrida', 'natural'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE booking_type AS ENUM ('open', 'tournament', 'private'); EXCEPTION WHEN duplicate_object THEN END $$;
DO $$ BEGIN CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed'); EXCEPTION WHEN duplicate_object THEN END $$;

-- 2. FUNCTION helper
CREATE OR REPLACE FUNCTION handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- 3. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'player',
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 4. teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  tagline TEXT,
  email TEXT,
  phone TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name)
);
DROP TRIGGER IF EXISTS teams_updated_at ON teams;
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 5. squads
CREATE TABLE IF NOT EXISTS squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category squad_category NOT NULL,
  custom_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  number SMALLINT CHECK (number BETWEEN 1 AND 99),
  position player_position,
  photo_url TEXT,
  registration_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS players_updated_at ON players;
CREATE TRIGGER players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 7. tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type tournament_type NOT NULL,
  category tournament_category NOT NULL,
  custom_category TEXT,
  max_teams INTEGER NOT NULL CHECK (max_teams > 1),
  start_date DATE NOT NULL,
  status tournament_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS tournaments_updated_at ON tournaments;
CREATE TRIGGER tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 8. tournament_teams
CREATE TABLE IF NOT EXISTS tournament_teams (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  squad_id UUID REFERENCES squads(id) ON DELETE SET NULL,
  status tournament_team_status NOT NULL DEFAULT 'pending',
  PRIMARY KEY (tournament_id, team_id)
);

-- 9. referees
CREATE TABLE IF NOT EXISTS referees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. tournament_referees
CREATE TABLE IF NOT EXISTS tournament_referees (
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES referees(id) ON DELETE CASCADE,
  PRIMARY KEY (tournament_id, referee_id)
);

-- 11. venues
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  type venue_type NOT NULL DEFAULT 'fut7',
  surface surface_type NOT NULL DEFAULT 'sintetica',
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  capacity SMALLINT NOT NULL DEFAULT 14,
  has_roof BOOLEAN NOT NULL DEFAULT false,
  has_lights BOOLEAN NOT NULL DEFAULT false,
  has_graderia BOOLEAN NOT NULL DEFAULT false,
  has_bathrooms BOOLEAN NOT NULL DEFAULT false,
  has_parking BOOLEAN NOT NULL DEFAULT false,
  opens_at TIME NOT NULL DEFAULT '08:00',
  closes_at TIME NOT NULL DEFAULT '23:00',
  description TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS venues_updated_at ON venues;
CREATE TRIGGER venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 12. venue_packages
CREATE TABLE IF NOT EXISTS venue_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_min SMALLINT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  is_promotion BOOLEAN NOT NULL DEFAULT false,
  valid_from DATE,
  valid_until DATE,
  valid_days SMALLINT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. venue_slots
CREATE TABLE IF NOT EXISTS venue_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(venue_id, date, start_time)
);

-- 14. bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  package_id UUID REFERENCES venue_packages(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type booking_type NOT NULL DEFAULT 'open',
  status booking_status NOT NULL DEFAULT 'pending',
  team_id UUID REFERENCES teams(id),
  opponent_team TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 15. matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  referee_id UUID REFERENCES referees(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status match_status NOT NULL DEFAULT 'scheduled',
  round SMALLINT,
  group_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS matches_updated_at ON matches;
CREATE TRIGGER matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 16. match_events
CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id),
  event_type match_event_type NOT NULL,
  minute SMALLINT NOT NULL CHECK (minute >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. match_results
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  home_score SMALLINT NOT NULL CHECK (home_score >= 0),
  away_score SMALLINT NOT NULL CHECK (away_score >= 0),
  registered_by UUID NOT NULL REFERENCES referees(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, name, email)
  VALUES (NEW.id, 'player'::user_role, NEW.email, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 19. Índices
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON tournaments(created_by);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_team ON tournament_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_tournament_refs_ref ON tournament_referees(referee_id);
CREATE INDEX IF NOT EXISTS idx_squads_team_id ON squads(team_id);
CREATE INDEX IF NOT EXISTS idx_players_squad_id ON players(squad_id);
CREATE INDEX IF NOT EXISTS idx_players_token ON players(registration_token);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player ON match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_venues_admin ON venues(admin_id);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_venue_packages_venue ON venue_packages(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_slots_venue_date ON venue_slots(venue_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_venue ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);

COMMIT;