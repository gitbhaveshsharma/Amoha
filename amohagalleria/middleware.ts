// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    const { data: { session } } = await supabase.auth.getSession()
    const protectedPaths = ['/dashboard']

    if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
        if (!session) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return res
}