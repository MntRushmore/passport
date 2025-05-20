-- First, drop all existing policies
DROP POLICY IF EXISTS "Anyone can read clubs" ON clubs;
DROP POLICY IF EXISTS "Users can create clubs" ON clubs;
DROP POLICY IF EXISTS "Leaders can update their own club" ON clubs;
DROP POLICY IF EXISTS "Admins can delete clubs" ON clubs;
DROP POLICY IF EXISTS "Anyone can read users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can create user records" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Anyone can read workshops" ON workshops;
DROP POLICY IF EXISTS "Admins can manage workshops" ON workshops;
DROP POLICY IF EXISTS "Anyone can read submissions" ON submissions;
DROP POLICY IF EXISTS "Leaders can create submissions for their club" ON submissions;
DROP POLICY IF EXISTS "Leaders can update their club's submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can delete submissions" ON submissions;
DROP POLICY IF EXISTS "Anyone can read club_members" ON club_members;
DROP POLICY IF EXISTS "Leaders can manage members in their club" ON club_members;

-- Enable Row Level Security on all tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- EXTREMELY SIMPLIFIED POLICIES
-- Allow all operations for authenticated users (temporary fix to eliminate recursion)
CREATE POLICY "Allow all operations for authenticated users on users" ON users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on clubs" ON clubs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on workshops" ON workshops
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on submissions" ON submissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on club_members" ON club_members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to read all tables (for public access)
CREATE POLICY "Allow anonymous to read users" ON users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to read clubs" ON clubs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to read workshops" ON workshops
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to read submissions" ON submissions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to read club_members" ON club_members
  FOR SELECT
  TO anon
  USING (true);
