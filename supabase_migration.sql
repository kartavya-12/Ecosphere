-- ============================================
-- EcoSphere: Supabase Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create ISSUES table
CREATE TABLE IF NOT EXISTS issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create EVENTS table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ,
  location TEXT,
  max_volunteers INT DEFAULT 50,
  created_by UUID REFERENCES auth.users(id),
  issue_id UUID REFERENCES issues(id),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create EVENT REGISTRATIONS table
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 4. Add new columns to profiles if they don't exist
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS org_name TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. Enable RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for ISSUES
DROP POLICY IF EXISTS "Anyone can read issues" ON issues;
CREATE POLICY "Anyone can read issues" ON issues FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can create issues" ON issues;
CREATE POLICY "Auth users can create issues" ON issues FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Anyone can update issues" ON issues;
CREATE POLICY "Anyone can update issues" ON issues FOR UPDATE USING (true);

-- 7. RLS Policies for EVENTS
DROP POLICY IF EXISTS "Anyone can read events" ON events;
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can create events" ON events;
CREATE POLICY "Auth users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can update events" ON events;
CREATE POLICY "Creators can update events" ON events FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can delete events" ON events;
CREATE POLICY "Creators can delete events" ON events FOR DELETE USING (auth.uid() = created_by);

-- 8. RLS Policies for EVENT_REGISTRATIONS
DROP POLICY IF EXISTS "Anyone can read registrations" ON event_registrations;
CREATE POLICY "Anyone can read registrations" ON event_registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can register" ON event_registrations;
CREATE POLICY "Auth users can register" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can update registrations" ON event_registrations;
CREATE POLICY "Anyone can update registrations" ON event_registrations FOR UPDATE USING (true);

-- 9. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;

-- 10. Migrate existing reports to issues (if reports table exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
    INSERT INTO issues (title, description, location, status, created_by, created_at)
    SELECT title, description, location, status, user_id, created_at
    FROM reports
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
