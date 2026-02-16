'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Bookmark, LogOut } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface NavbarProps {
  userEmail: string
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
      })
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-2">
            <Bookmark className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Smart Bookmarks</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}
