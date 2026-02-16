import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_error`)
    }

    if (data?.session) {
      console.log('Session created successfully for user:', data.user?.email)
      // Session is set, cookies are automatically handled by the server client
      return NextResponse.redirect(`${origin}`)
    }
  }

  // If no code or session creation failed, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
