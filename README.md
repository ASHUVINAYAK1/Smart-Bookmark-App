# Smart Bookmark Manager

A modern, real-time bookmark manager built with Next.js, Supabase, and shadcn/ui.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 📚 **Bookmark Management** - Add and delete bookmarks with URL and title
- 🔄 **Real-time Sync** - Changes appear instantly across all open tabs
- 🔒 **Private & Secure** - Each user can only see their own bookmarks (RLS)
- 🎨 **Clean UI** - Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive** - Works great on desktop and mobile
- ⚡ **Fast** - Server-side rendering with Next.js App Router

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database & Auth:** Supabase
- **Real-time:** Supabase Realtime
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Language:** TypeScript
- **Deployment:** Vercel

## Project Structure

```
Smart-Bookmark-App/
├── app/
│   ├── api/auth/signout/     # Sign out API endpoint
│   ├── auth/callback/        # OAuth callback handler
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout with Toaster
│   ├── page.tsx              # Main bookmarks page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── navbar.tsx            # Navigation bar
│   ├── add-bookmark-form.tsx # Form to add bookmarks
│   └── bookmark-list.tsx     # List with real-time updates
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   ├── server.ts         # Server Supabase client
│   │   └── middleware.ts     # Middleware helper
│   └── utils.ts              # Utility functions
├── types/
│   └── database.ts           # TypeScript types
├── middleware.ts             # Next.js auth middleware
└── SETUP.md                  # Setup instructions
```

## Getting Started

See [SETUP.md](SETUP.md) for complete setup instructions.

### Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase and configure environment variables in `.env.local`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Key Features Implementation

### Authentication
- Google OAuth via Supabase Auth
- Protected routes with Next.js middleware
- Automatic session refresh

### Real-time Updates
- Supabase Realtime subscriptions
- Automatic UI updates on INSERT/DELETE events
- Works across multiple browser tabs

### Security
- Row Level Security (RLS) policies
- Server-side authentication checks
- Secure cookie handling

### UI/UX
- Clean, modern design
- Toast notifications for user feedback
- Loading states
- Empty states
- Mobile responsive

## Problems Encountered & Solutions

### Real-time Updates Not Working

**Problem:** Bookmarks were not updating in real-time across tabs. The subscription showed `SUBSCRIBED` status, but no events were being received when adding or deleting bookmarks.

**Root Causes Identified:**

1. **React useEffect Dependency Issue**
   - **Problem:** The `supabase` client instance was included in the useEffect dependency array, causing the subscription to recreate on every render
   - **Solution:**
     - Used `useMemo` to create a stable Supabase client instance
     - Removed `supabase` from the useEffect dependencies
     - Only kept `userId` in the dependency array

2. **Missing REPLICA IDENTITY**
   - **Problem:** The `bookmarks` table didn't have proper replica identity set, which prevented Supabase Realtime from broadcasting change events
   - **Solution:** Set replica identity to FULL with SQL:
     ```sql
     ALTER TABLE bookmarks REPLICA IDENTITY FULL;
     ```
   - This command enables PostgreSQL to track all column changes and broadcast them via Realtime

3. **Realtime Publication Configuration**
   - **Problem:** Initial confusion about enabling Realtime - the Database Replication UI is different from Realtime configuration
   - **Solution:** Verified the table was added to the `supabase_realtime` publication:
     ```sql
     ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
     ```

**Final Working Implementation:**

```typescript
// bookmark-list.tsx
const supabase = useMemo(() => createClient(), []) // Stable client instance

useEffect(() => {
  const channel = supabase
    .channel(`bookmarks-${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bookmarks',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      // Handle INSERT, DELETE, UPDATE events
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId]) // Only userId in dependencies
```

**Verification Steps:**
1. Check subscription status logs for `SUBSCRIBED`
2. Open two browser tabs
3. Add/delete bookmark in one tab
4. Verify event logs appear in console: `✅ Real-time event received: INSERT`
5. Confirm UI updates without page refresh

**Key Takeaways:**
- `REPLICA IDENTITY FULL` is crucial for Realtime to work properly
- Avoid putting Supabase client instances in React dependency arrays
- The Supabase "Database Replication" UI is for data warehousing, not Realtime
- Always test real-time features across multiple browser tabs/windows

---

## Database Schema

```sql
table bookmarks {
  id uuid primary key
  user_id uuid (references auth.users)
  title text
  url text
  created_at timestamp
}
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Deployment

Deploy to Vercel with one click:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy
5. Update OAuth redirect URLs

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## License

MIT

## Author

Built with Claude Code
