-- Run this in Supabase SQL Editor to enable Realtime

-- Enable Realtime for bookmarks table
alter publication supabase_realtime add table bookmarks;

-- Verify it's enabled (you should see 'bookmarks' in the results)
select * from pg_publication_tables where pubname = 'supabase_realtime';

-- Also verify RLS policies exist
select * from pg_policies where tablename = 'bookmarks';
