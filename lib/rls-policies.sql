-- Enable Row Level Security on all tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- Create policies for clubs table
-- Admins can do anything
CREATE POLICY "Admins can do anything with clubs" ON clubs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  ));

-- Leaders can read their own club
CREATE POLICY "Leaders can read their own club" ON clubs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.club_id = clubs.id
    AND users.role = 'leader'
  ));

-- Members can read any club
CREATE POLICY "Anyone can read clubs" ON clubs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for users table
-- Admins can do anything
CREATE POLICY "Admins can do anything with users" ON users
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_id = auth.uid()
    AND u.role = 'admin'
  ));

-- Users can read and update their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Leaders can read users in their club
CREATE POLICY "Leaders can read users in their club" ON users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_id = auth.uid()
    AND u.role = 'leader'
    AND u.club_id = users.club_id
  ));

-- Create policies for workshops table
-- Anyone can read workshops
CREATE POLICY "Anyone can read workshops" ON workshops
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can do anything with workshops
CREATE POLICY "Admins can do anything with workshops" ON workshops
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  ));

-- Create policies for submissions table
-- Admins can do anything
CREATE POLICY "Admins can do anything with submissions" ON submissions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  ));

-- Leaders can create submissions for their club
CREATE POLICY "Leaders can create submissions for their club" ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'leader'
    AND users.club_id = submissions.club_id
  ));

-- Leaders can read submissions for their club
CREATE POLICY "Leaders can read submissions for their club" ON submissions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'leader'
    AND users.club_id = submissions.club_id
  ));

-- Members can read submissions for their club
CREATE POLICY "Members can read submissions for their club" ON submissions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.club_id = submissions.club_id
  ));

-- Create policies for club_members table
-- Admins can do anything
CREATE POLICY "Admins can do anything with club_members" ON club_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  ));

-- Leaders can manage members in their club
CREATE POLICY "Leaders can manage members in their club" ON club_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'leader'
    AND users.club_id = club_members.club_id
  ));

-- Members can read club_members for their club
CREATE POLICY "Members can read club_members for their club" ON club_members
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.club_id = club_members.club_id
  ));
