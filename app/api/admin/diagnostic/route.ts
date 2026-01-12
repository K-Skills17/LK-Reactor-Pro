import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/diagnostic
 * Check if all required environment variables are set
 */
export async function GET() {
  try {
    const checks = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
    };

    const allPresent = checks.NEXT_PUBLIC_SUPABASE_URL && 
                       checks.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                       checks.SUPABASE_SERVICE_ROLE_KEY;

    return NextResponse.json({
      status: allPresent ? 'OK' : 'INCOMPLETE',
      checks,
      message: allPresent 
        ? '✅ All required environment variables are set' 
        : '❌ Missing required environment variables',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
