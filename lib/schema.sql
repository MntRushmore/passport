-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id TEXT UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  club_id UUID REFERENCES clubs(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('member', 'leader', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workshops table
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration VARCHAR(50),
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workshop_id UUID NOT NULL REFERENCES workshops(id),
  club_id UUID NOT NULL REFERENCES clubs(id),
  user_id UUID NOT NULL REFERENCES users(id),
  event_code VARCHAR(50) NOT NULL,
  photo_url TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create club_members table for many-to-many relationship
CREATE TABLE IF NOT EXISTS club_members (
  club_id UUID NOT NULL REFERENCES clubs(id),
  user_id UUID NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (club_id, user_id)
);

-- Create views for easier querying
CREATE OR REPLACE VIEW club_stats AS
SELECT 
  c.id,
  c.name,
  COUNT(DISTINCT cm.user_id) AS member_count,
  COUNT(DISTINCT s.id) AS completed_workshops
FROM 
  clubs c
LEFT JOIN 
  club_members cm ON c.id = cm.club_id
LEFT JOIN 
  submissions s ON c.id = s.club_id
GROUP BY 
  c.id, c.name;

CREATE OR REPLACE VIEW submission_details AS
SELECT 
  s.id,
  s.event_code,
  s.photo_url,
  s.notes,
  s.status,
  s.created_at AS submission_date,
  w.id AS workshop_id,
  w.title AS workshop_title,
  w.emoji AS workshop_emoji,
  c.id AS club_id,
  c.name AS club_name,
  u.id AS user_id,
  u.name AS user_name
FROM 
  submissions s
JOIN 
  workshops w ON s.workshop_id = w.id
JOIN 
  clubs c ON s.club_id = c.id
JOIN 
  users u ON s.user_id = u.id;

-- Add triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clubs_updated_at
BEFORE UPDATE ON clubs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshops_updated_at
BEFORE UPDATE ON workshops
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
