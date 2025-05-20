-- Create a function to check RLS status
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'users_rls', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'users'),
    'clubs_rls', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'clubs'),
    'workshops_rls', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'workshops'),
    'submissions_rls', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'submissions'),
    'club_members_rls', (SELECT rls_enabled FROM pg_tables WHERE tablename = 'club_members')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
