# Smart Bookmark Manager - Setup Guide

## Current Status
✅ All application code is complete and ready to use!

Now you need to:
1. Set up Supabase (database and auth)
2. Configure Google OAuth
3. Update environment variables
4. Test locally
5. Deploy to Vercel

---

## Step 1: Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Project name: `smart-bookmarks` (or any name)
   - Database password: Generate a strong password (save it)
   - Region: Choose closest to you
4. Click "Create new project" and wait for setup to complete

---

## Step 2: Set Up Database (3 minutes)

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create bookmarks table
create table bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index bookmarks_user_id_idx on bookmarks(user_id);
create index bookmarks_created_at_idx on bookmarks(created_at desc);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- RLS Policies: Users can only access their own bookmarks
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookmarks;
```

4. Click "Run" to execute the SQL

---

## Step 3: Configure Google OAuth (10 minutes)

### 3.1 Get Supabase Callback URL

1. In Supabase, go to **Authentication > Providers**
2. Copy the "Callback URL" (looks like: `https://xxxxx.supabase.co/auth/v1/callback`)

### 3.2 Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services > OAuth consent screen**
   - User Type: External
   - App name: Smart Bookmark Manager
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue" through all steps
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth 2.0 Client ID**
   - Application type: Web application
   - Name: Smart Bookmarks
   - Authorized redirect URIs:
     - Add the Supabase callback URL you copied
     - Add `http://localhost:3000/auth/callback` (for local testing)
   - Click "Create"
6. **Copy the Client ID and Client Secret** (you'll need these next)

### 3.3 Configure Supabase Provider

1. Back in Supabase, go to **Authentication > Providers**
2. Find "Google" and enable it
3. Paste:
   - Client ID (from Google)
   - Client Secret (from Google)
4. Click "Save"

---

## Step 4: Update Environment Variables (2 minutes)

1. In Supabase, go to **Settings > API**
2. Copy:
   - Project URL
   - Anon/Public key

3. Update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholder values with your actual Supabase credentials.

---

## Step 5: Test Locally (5 minutes)

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser

3. Test the following:
   - [ ] Login with Google works
   - [ ] Add a bookmark
   - [ ] Bookmark appears in the list
   - [ ] Delete a bookmark
   - [ ] Open two tabs and verify real-time updates:
     - Add a bookmark in tab 1 → should appear in tab 2 without refresh
     - Delete in tab 2 → should disappear in tab 1 without refresh
   - [ ] Logout works

---

## Step 6: Deploy to Vercel (5 minutes)

### 6.1 Push to GitHub

```bash
git add .
git commit -m "Initial Smart Bookmark Manager implementation"
git push origin main
```

(If you haven't set up a remote repository yet, create one on GitHub first)

### 6.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click "Deploy"

### 6.3 Update OAuth Redirect URLs

After deployment, Vercel will give you a URL (e.g., `https://your-app.vercel.app`)

1. **Google Cloud Console:**
   - Go back to your OAuth credentials
   - Add `https://your-app.vercel.app/auth/callback` to Authorized redirect URIs
   - Save

2. **Supabase:**
   - Go to Authentication > URL Configuration
   - Add `https://your-app.vercel.app/auth/callback` to Redirect URLs
   - Update Site URL to `https://your-app.vercel.app`
   - Save

---

## Step 7: Test Production (3 minutes)

1. Visit your Vercel URL
2. Test:
   - [ ] Login with Google works
   - [ ] Add bookmarks
   - [ ] Real-time updates work
   - [ ] Delete bookmarks
   - [ ] Logout works

---

## Troubleshooting

### "Invalid OAuth redirect URI"
- Ensure all redirect URLs are added to both Google Cloud Console and Supabase
- URLs must match exactly (including protocol: https://)

### "Failed to add bookmark"
- Check Supabase RLS policies are created correctly
- Verify user is authenticated (check browser console)

### Real-time not working
- Ensure Realtime is enabled on bookmarks table
- Check browser console for WebSocket errors
- Verify RLS policies allow SELECT

### Build errors on Vercel
- Ensure all environment variables are set in Vercel
- Check build logs for specific errors

---

## Next Steps (Optional Enhancements)

- Add bookmark editing capability
- Add tags/categories
- Add search functionality
- Add bookmark import/export
- Add dark mode
- Add keyboard shortcuts

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs (Database > Logs)
3. Verify all environment variables are set correctly
4. Ensure OAuth redirect URLs are configured properly

Enjoy your new Smart Bookmark Manager! 🎉
