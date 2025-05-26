import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Get the session - will be available for API routes
    const { data: { session } } = await supabase.auth.getSession()

    // Protect dashboard routes
    const protectedPaths = ['/dashboard']
    if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) && !session) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // For API routes, adding session validation is sufficient
    // The actual route handlers should do the role-based authorization
    // We can't reliably check admin privileges here because middleware
    // doesn't have access to the service role key for security reasons
    if (request.nextUrl.pathname.startsWith('/api/admin') && !session) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        )
    }

    return res
}

// Specify which paths this middleware should run on
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/admin/:path*'
    ]
}