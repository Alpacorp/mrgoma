import { auth } from '@/app/utils/authOptions';
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  
   const session = await auth()

   if (!session){
      return NextResponse.redirect(new URL('/', request.url))
   }  
  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
}