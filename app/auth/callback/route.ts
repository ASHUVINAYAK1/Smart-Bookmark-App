import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const isHttps = requestUrl.protocol === 'https:'

  console.log('🔄 OAuth callback - Origin:', origin, 'HTTPS:', isHttps, 'Code:', code ? 'present' : 'missing')

  if (code) {
    const response = NextResponse.redirect(new URL('/', origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set({
                name,
                value,
              })
            )
            console.log('🍪 Setting cookies:', cookiesToSet.map(c => c.name).join(', '))
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, {
                ...options,
                sameSite: 'lax',
                secure: isHttps,
              })
            )
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ Auth error:', error.message, error.status)
      return NextResponse.redirect(new URL('/login', origin))
    }

    console.log('✅ Auth successful:', data.user?.email)
    return response
  }

  console.log('⚠️ No code provided, redirecting to login')
  return NextResponse.redirect(new URL('/login', origin))
}
