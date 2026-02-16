# Real-time Feature Testing Guide

## Prerequisites
Make sure you've completed:
- ✅ Ran the SQL schema in Supabase
- ✅ Updated `.env.local` with real Supabase credentials
- ✅ Enabled Realtime for bookmarks table

## Step-by-Step Test

### 1. Enable Realtime in Supabase

Go to **Database** → **Replication** in your Supabase project:
- Find `bookmarks` table
- Toggle it **ON** (green)

If you don't see it, run this SQL:
```sql
alter publication supabase_realtime add table bookmarks;
```

### 2. Verify Realtime is Enabled

Run this SQL to check:
```sql
select * from pg_publication_tables where pubname = 'supabase_realtime';
```

You should see a row with `tablename = 'bookmarks'`

### 3. Check Realtime API Settings

In Supabase:
1. Go to **Settings** → **API**
2. Scroll down to **Realtime API**
3. Make sure it's enabled and shows a WebSocket URL

### 4. Test Locally

1. Start the dev server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser

3. **Open Browser Console** (F12 or Right-click → Inspect → Console)

4. Look for these logs:
   - `Realtime channel created for user: [your-user-id]`
   - `Realtime subscription status: SUBSCRIBED` (this is crucial!)

5. Add a bookmark

6. Check console for:
   - `Real-time event received: INSERT [bookmark data]`
   - `Adding new bookmark: [bookmark data]`

### 5. Test Multi-Tab Real-time

1. Keep the first tab open with Console visible
2. Open http://localhost:3000 in a **NEW TAB**
3. Add a bookmark in Tab 2
4. Check Tab 1:
   - Console should show: `Real-time event received: INSERT`
   - Bookmark should appear **WITHOUT REFRESH**

### 6. Common Issues & Solutions

#### Issue: "Realtime subscription status: CLOSED" or "CHANNEL_ERROR"
**Solution:**
- Check that Realtime is enabled on the bookmarks table
- Verify RLS policies allow SELECT (users need read access)
- Check browser console for WebSocket errors

#### Issue: No real-time events received
**Solution:**
- Run: `alter publication supabase_realtime add table bookmarks;`
- Restart your dev server
- Hard refresh browser (Ctrl+Shift+R)

#### Issue: "WebSocket connection failed"
**Solution:**
- Check internet connection
- Verify Supabase project is not paused
- Check if firewall is blocking WebSocket connections

#### Issue: Events received but UI doesn't update
**Solution:**
- Check browser console for JavaScript errors
- Verify the userId matches between tabs
- Clear browser cache and restart

### 7. Debug Checklist

Run through this if real-time still doesn't work:

```sql
-- 1. Check if bookmarks table exists
select * from pg_tables where tablename = 'bookmarks';

-- 2. Check if RLS is enabled
select tablename, rowsecurity from pg_tables where tablename = 'bookmarks';

-- 3. Check RLS policies
select * from pg_policies where tablename = 'bookmarks';

-- 4. Check Realtime publication
select * from pg_publication_tables where pubname = 'supabase_realtime';

-- 5. Test insert (should work if logged in)
-- Do this from the Supabase SQL editor while logged in:
select auth.uid(); -- Should return your user ID
```

### 8. Manual Realtime Test

If nothing works, try this manual test in browser console:

```javascript
// In browser console after logging in
const { createClient } = await import('/lib/supabase/client.ts')
const supabase = createClient()

// Subscribe to changes
const channel = supabase
  .channel('test-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookmarks'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe((status) => {
    console.log('Status:', status)
  })

// Status should be 'SUBSCRIBED'
// Now add a bookmark and watch for logs
```

### 9. Expected Console Output

When working correctly, you should see:
```
Realtime channel created for user: abc-123-def
Realtime subscription status: SUBSCRIBED
Real-time event received: INSERT {eventType: "INSERT", new: {...}, old: null}
Adding new bookmark: {id: "...", title: "...", url: "..."}
```

## Still Not Working?

If you've tried everything:

1. **Check Supabase Project Status**
   - Ensure project is not paused
   - Check Supabase Status page: status.supabase.com

2. **Verify Environment Variables**
   ```bash
   # Print env vars (remove after testing)
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Test with Supabase CLI** (optional)
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref your-project-ref

   # Check realtime status
   supabase db inspect realtime
   ```

4. **Contact for Help**
   - Supabase Discord: discord.supabase.com
   - Share console logs and error messages

## Success Criteria

✅ Console shows "Realtime subscription status: SUBSCRIBED"
✅ Adding bookmark in one tab shows it in another tab instantly
✅ Deleting bookmark in one tab removes it in another tab instantly
✅ No page refresh needed
✅ Works across multiple devices (if deployed)
