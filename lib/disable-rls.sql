-- Completely disable RLS on all tables temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE workshops DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE club_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Allow all operations for authenticated users on users" ON users;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on clubs" ON clubs;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on workshops" ON workshops;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on submissions" ON submissions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on club_members" ON club_members;
DROP POLICY IF EXISTS "Allow anonymous to read users" ON users;
DROP POLICY IF EXISTS "Allow anonymous to read clubs" ON clubs;
DROP POLICY IF EXISTS "Allow anonymous to read workshops" ON workshops;
DROP POLICY IF EXISTS "Allow anonymous to read submissions" ON submissions;
DROP POLICY IF EXISTS "Allow anonymous to read club_members" ON club_members;

-- Create a function to safely get user data
CREATE OR REPLACE FUNCTION get_user_data_safe(user_auth_id TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  club_id UUID,
  club_name TEXT,
  role TEXT
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.avatar_url,
    u.club_id,
    c.name as club_name,
    u.role::TEXT
  FROM 
    users u
  LEFT JOIN 
    clubs c ON u.club_id = c.id
  WHERE 
    u.auth_id = user_auth_id;
END;
$$ LANGUAGE plpgsql;
