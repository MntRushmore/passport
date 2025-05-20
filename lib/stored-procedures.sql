-- Create a stored procedure to get user data safely
CREATE OR REPLACE FUNCTION get_user_data(user_auth_id TEXT)
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
