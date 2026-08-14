'use server';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    // The Supabase client-side auth will handle the code exchange
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.redirect(new URL('/login', request.url));
}
