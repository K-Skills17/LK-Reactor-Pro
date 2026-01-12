import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyPassword, generateSessionToken } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/login
 * Admin login with email and password
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Login] Starting login process...');
    
    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Admin Login] Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta (SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();
    console.log('[Admin Login] Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Find admin user by email
    console.log('[Admin Login] Querying database for user...');
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (adminError) {
      console.error('[Admin Login] Database error:', adminError);
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    if (!admin) {
      console.log('[Admin Login] User not found');
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    console.log('[Admin Login] User found, verifying password...');
    
    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password_hash);
    console.log('[Admin Login] Password valid:', isValidPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Update last login
    console.log('[Admin Login] Updating last login...');
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // Generate session token
    const sessionToken = generateSessionToken();
    console.log('[Admin Login] Login successful');

    return NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('[Admin Login] Unexpected error:', error);
    console.error('[Admin Login] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Erro ao fazer login. Tente novamente.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
