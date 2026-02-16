-- COMPLETE FIX FOR REALTIME + RLS
-- Run this entire script in Supabase SQL Editor

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

-- Step 2: Recreate policies with REALTIME support
-- IMPORTANT: For Realtime to work, SELECT policy must allow it

-- Allow users to view their own bookmarks (needed for Realtime)
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Step 3: Ensure Realtime is enabled
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS bookmarks;
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;

-- Step 4: Verify setup
SELECT 'RLS Enabled:' as check_name,
       CASE WHEN rowsecurity THEN 'YES ✅' ELSE 'NO ❌' END as status
FROM pg_tables
WHERE tablename = 'bookmarks';

SELECT 'Realtime Enabled:' as check_name,
       CASE WHEN COUNT(*) > 0 THEN 'YES ✅' ELSE 'NO ❌' END as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'bookmarks';

SELECT 'RLS Policies:' as check_name,
       COUNT(*)::text || ' policies found' as status
FROM pg_policies
WHERE tablename = 'bookmarks';

-- Step 5: Show all policies
SELECT policyname, cmd, qual::text
FROM pg_policies
WHERE tablename = 'bookmarks';
