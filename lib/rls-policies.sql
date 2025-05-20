-- Enable Row Level Security on all tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- Create policies for clubs table
-- Anyone can read clubs
CREATE POLICY "Anyone can read clubs" ON clubs
  FOR SELECT
  USING (true);

-- Users can create clubs
CREATE POLICY "Users can create clubs" ON clubs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Leaders can update their own club
CREATE POLICY "Leaders can update their own club" ON clubs
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.club_id = clubs.id
    AND users.role = 'leader'
  ));

-- Admins can delete clubs
CREATE POLICY "Admins can delete clubs" ON clubs
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  ));

-- Create policies for users table
-- Anyone can read users
CREATE POLICY "Anyone can read users" ON users
  FOR SELECT
  USING (true);

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Authenticated users can create user records
CREATE POLICY "Authenticated users can create user records" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_id = auth.uid()
    AND u.role = 'admin'
  ));

-- Create policies for workshops table
-- Anyone can read workshops
CREATE POLICY "Anyone can read workshops" ON workshops
  FOR SELECT
  TO authenticated
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
-- Anyone can read submissions
CREATE POLICY "Anyone can read submissions" ON submissions
  FOR SELECT
  TO authenticated
  USING (true);

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

-- Leaders can update their club's submissions
CREATE POLICY "Leaders can update their club's submissions" ON submissions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'leader'
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
-- Anyone can read club_members
CREATE POLICY "Anyone can read club_members" ON club_members
  FOR SELECT
  TO authenticated
  USING (true);

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
