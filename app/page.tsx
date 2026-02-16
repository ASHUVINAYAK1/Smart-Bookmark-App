import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { AddBookmarkForm } from '@/components/add-bookmark-form'
import { BookmarkList } from '@/components/bookmark-list'

export default async function Home() {
  const supabase = await createClient()

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch initial bookmarks
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userEmail={user.email || ''} />
      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AddBookmarkForm userId={user.id} />
          </div>
          <div className="lg:col-span-2">
            <BookmarkList initialBookmarks={bookmarks || []} userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
