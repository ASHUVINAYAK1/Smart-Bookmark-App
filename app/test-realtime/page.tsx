'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestRealtimePage() {
  const [status, setStatus] = useState<string>('Connecting...')
  const [events, setEvents] = useState<any[]>([])
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const supabase = createClient()

    // Get user ID
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      }
    })

    const channel = supabase
      .channel('test-realtime-connection')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          console.log('🎉 EVENT RECEIVED:', payload)
          setEvents(prev => [payload, ...prev].slice(0, 10))
        }
      )
      .subscribe((status) => {
        console.log('Connection status:', status)
        setStatus(status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Realtime Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>User ID:</strong> {userId || 'Loading...'}
          </div>
          <div>
            <strong>Connection Status:</strong>{' '}
            <span className={
              status === 'SUBSCRIBED' ? 'text-green-600 font-bold' :
              status === 'CHANNEL_ERROR' ? 'text-red-600 font-bold' :
              'text-yellow-600'
            }>
              {status}
            </span>
          </div>

          {status === 'SUBSCRIBED' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              ✅ Realtime is working! Add or delete a bookmark in another tab to see events here.
            </div>
          )}

          {status === 'CHANNEL_ERROR' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              ❌ Realtime connection failed. Check Supabase dashboard.
            </div>
          )}

          <div>
            <strong>Recent Events ({events.length}):</strong>
            <div className="mt-2 space-y-2">
              {events.length === 0 ? (
                <p className="text-gray-500">No events yet. Try adding or deleting a bookmark.</p>
              ) : (
                events.map((event, i) => (
                  <div key={i} className="p-2 bg-gray-100 rounded text-xs">
                    <strong>{event.eventType}</strong>: {JSON.stringify(event.new || event.old)}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
