import { userauthstore } from '@/Store/UserAuthStore'
import { NextResponse } from 'next/server'

export async function middleware(request) {

    console.log("middleware called");


    const { checkauth } = userauthstore()
    const token = request.cookies.get('token')?.value

    const url = request.nextUrl.clone()

    if (!token) {
        // If no token, redirect to login
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    try {
        // Send request to backend to verify token and get role
        const user = await checkauth()

        if (!user) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }


        const userRole = user.role // assuming backend sends { role: 'admin' }

        const pathname = request.nextUrl.pathname

        // If user is admin, and visiting /dashboard, redirect to /admin-dashboard
        if (pathname === '/' && userRole === 'admin') {
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }

        // Add more conditions if needed
        return NextResponse.next()
    } catch (error) {
        console.error('Middleware error:', error)
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }
}

export const config = {
    matcher: ['/customer/:path*'],
    
}