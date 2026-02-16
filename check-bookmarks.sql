-- Run this in Supabase SQL Editor to see all bookmarks

-- Check if bookmarks exist
SELECT * FROM bookmarks ORDER BY created_at DESC;

-- Check how many bookmarks you have
SELECT COUNT(*) as total_bookmarks FROM bookmarks;

-- Check which user they belong to
SELECT user_id, COUNT(*) as bookmark_count
FROM bookmarks
GROUP BY user_id;
