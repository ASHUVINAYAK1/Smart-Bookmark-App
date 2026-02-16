'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'

interface AddBookmarkFormProps {
  userId: string
}

export function AddBookmarkForm({ userId }: AddBookmarkFormProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!url || !title) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields',
      })
      return
    }

    // URL validation
    try {
      new URL(url)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid URL',
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('📝 Inserting bookmark for user:', userId)
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          title,
          url,
        })
        .select()

      if (error) {
        console.error('❌ Insert error:', error)
        throw error
      }

      console.log('✅ Bookmark inserted successfully:', data)

      toast({
        title: 'Success',
        description: 'Bookmark added successfully',
      })

      // Clear form
      setUrl('')
      setTitle('')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add bookmark. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Bookmark
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="My awesome website"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Bookmark'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
