'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ExternalLink, Trash2, Bookmark as BookmarkIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BookmarkListProps {
  initialBookmarks: Bookmark[]
  userId: string
}

export function BookmarkList({ initialBookmarks, userId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  // Update bookmarks when initialBookmarks change
  useEffect(() => {
    setBookmarks(initialBookmarks)
  }, [initialBookmarks])

  useEffect(() => {
    console.log('🔄 Setting up real-time subscription for user:', userId)
    console.log('📍 Environment:', process.env.NODE_ENV)
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    // Set up real-time subscription
    const channel = supabase
      .channel(`bookmarks-${userId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          // Temporarily removed filter to debug
        },
        (payload) => {
          console.log('🎯 Real-time event received!')
          console.log('Event type:', payload.eventType)
          console.log('Payload:', JSON.stringify(payload, null, 2))
          console.log('User ID from payload:', payload.new?.user_id || payload.old?.user_id)
          console.log('Current user ID:', userId)

          // Filter events to only process current user's bookmarks
          const eventUserId = payload.new?.user_id || payload.old?.user_id
          if (eventUserId !== userId) {
            console.log('⏭️ Skipping event for different user:', eventUserId)
            return
          }

          if (payload.eventType === 'INSERT') {
            console.log('➕ Adding new bookmark:', payload.new)
            setBookmarks((prev) => {
              // Check if bookmark already exists to avoid duplicates
              if (prev.some((b) => b.id === payload.new.id)) {
                console.log('⚠️ Bookmark already exists, skipping')
                return prev
              }
              return [payload.new as Bookmark, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Deleting bookmark:', payload.old.id)
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            console.log('📝 Updating bookmark:', payload.new)
            setBookmarks((prev) =>
              prev.map((b) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
            )
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Realtime subscription status:', status)
        if (err) {
          console.error('❌ Subscription error:', err)
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe to real-time updates')
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out')
        } else if (status === 'CLOSED') {
          console.warn('🔒 Channel closed')
        }
      })

    // Cleanup subscription
    return () => {
      console.log('🧹 Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [userId]) // FIXED: Removed supabase from dependencies

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Bookmark deleted successfully',
      })

      // Refresh the page data to remove the deleted bookmark
      console.log('🔄 Refreshing page data after delete...')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete bookmark. Please try again.',
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookmarkIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No bookmarks yet</CardTitle>
          <CardDescription>
            Start adding your favorite websites to keep them organized
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg line-clamp-1">{bookmark.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {truncateUrl(bookmark.url)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Added on {formatDate(bookmark.created_at)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(bookmark.url, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(bookmark.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
