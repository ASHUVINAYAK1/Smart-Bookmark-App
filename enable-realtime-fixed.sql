-- FIXED: Enable Realtime for bookmarks table
-- Run this in Supabase SQL Editor

-- Step 1: Set replica identity (important for realtime)
ALTER TABLE bookmarks REPLICA IDENTITY FULL;

-- Step 2: Add table to realtime publication
-- Note: If it's already added, you'll get a harmless error that can be ignored
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;

-- Step 3: Verify it's enabled
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'bookmarks';

-- You should see one row with bookmarks
-- If you see the row, Realtime is enabled! ✅
