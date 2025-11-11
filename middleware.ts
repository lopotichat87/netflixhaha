import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware désactivé - La protection est gérée côté client
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
