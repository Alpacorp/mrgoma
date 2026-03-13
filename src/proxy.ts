import { auth } from '@/app/utils/authOptions';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = await auth();
  const pathName = request.nextUrl.pathname;

  const publicRoute = !pathName.includes('dashboard');

  //nonpublic route
  if (!session && !publicRoute) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (session && publicRoute && pathName) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
