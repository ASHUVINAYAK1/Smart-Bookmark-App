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
