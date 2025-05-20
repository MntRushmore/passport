-- Drop existing policies to recreate them
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

-- Create policies for clubs table
CREATE POLICY "Anyone can read clubs" ON clubs
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create clubs" ON clubs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Leaders can update their own club" ON clubs
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.club_id = clubs.id
    AND users.role = 'leader'
  ));

CREATE POLICY "Admins can delete clubs" ON clubs
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  ));

-- Create policies for users table
-- CRITICAL FIX: Allow all users to read all user records without any checks
-- This prevents the infinite recursion
CREATE POLICY "Anyone can read users" ON users
  FOR SELECT
  USING (true);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

-- Authenticated users can create user records
CREATE POLICY "Authenticated users can create user records" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can delete users - FIXED to avoid recursion by using a direct auth.uid() check
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_id = auth.uid() 
    AND u.role = 'admin'
  ));

-- Create policies for workshops table
CREATE POLICY "Anyone can read workshops" ON workshops
  FOR SELECT
  USING (true);

-- Admins can create, update, delete workshops
CREATE POLICY "Admins can manage workshops" ON workshops
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  ));

-- Create policies for submissions table
CREATE POLICY "Anyone can read submissions" ON submissions
  FOR SELECT
  USING (true);

-- Leaders can create submissions for their club
CREATE POLICY "Leaders can create submissions for their club" ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('leader', 'admin')
    AND users.club_id = submissions.club_id
  ));

-- Leaders can update their club's submissions
CREATE POLICY "Leaders can update their club's submissions" ON submissions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('leader', 'admin')
    AND users.club_id = submissions.club_id
  ));

-- Admins can delete submissions
CREATE POLICY "Admins can delete submissions" ON submissions
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  ));

-- Create policies for club_members table
CREATE POLICY "Anyone can read club_members" ON club_members
  FOR SELECT
  USING (true);

-- Leaders can manage members in their club
CREATE POLICY "Leaders can manage members in their club" ON club_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('leader', 'admin')
    AND users.club_id = club_members.club_id
  ));
