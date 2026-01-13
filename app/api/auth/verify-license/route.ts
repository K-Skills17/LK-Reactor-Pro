import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Verify Bearer token from Authorization header
 */
function verifyBearerToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  const expectedToken = process.env.SENDER_SERVICE_TOKEN;

  if (!expectedToken) {
    console.error('[API] SENDER_SERVICE_TOKEN not configured');
    return false;
  }

  return token === expectedToken;
}

export async function POST(request: NextRequest) {
  // Verify Bearer token
  if (!verifyBearerToken(request)) {
    return NextResponse.json(
      { valid: false, error: 'Unauthorized - Invalid or missing Bearer token' },
      { status: 401 }
    );
  }
  
  try {
    const { license_key } = await request.json();
    
    if (!license_key) {
      return NextResponse.json(
        { valid: false, error: 'License key required' },
        { status: 400 }
      );
    }
    
    // Find clinic by license key
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .select('*')
      .eq('license_key', license_key)
      .single();
    
    if (clinicError || !clinic) {
      return NextResponse.json(
        { valid: false, error: 'Invalid license key' },
        { status: 401 }
      );
    }
    
    // Get subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (subError || !subscription) {
      return NextResponse.json(
        { valid: false, error: 'No subscription found' },
        { status: 401 }
      );
    }
    
    // Check if subscription is active
    if (subscription.status !== 'active') {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Subscription ${subscription.status}. Please activate your subscription.`,
          status: subscription.status
        },
        { status: 401 }
      );
    }
    
    // Get features based on tier
    const features = getTierFeatures(subscription.tier);
    
    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabaseAdmin
      .from('usage_tracking')
      .select('*')
      .eq('clinic_id', clinic.id)
      .eq('date', today)
      .single();
    
    return NextResponse.json({
      valid: true,
      user: {
        id: clinic.id,
        name: clinic.name || clinic.clinic_name || 'User',
        email: clinic.email,
        clinic_name: clinic.clinic_name,
        phone: clinic.phone,
        doctor_name: clinic.doctor_name,
        profile_picture_url: clinic.profile_picture_url
      },
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        billing_cycle: subscription.billing_cycle,
        amount: subscription.amount,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end
      },
      features,
      usage: {
        messages_sent_today: usage?.messages_sent || 0,
        ai_generations_today: usage?.ai_generations || 0,
        campaigns_created_today: usage?.campaigns_created || 0
      }
    });
    
  } catch (error: any) {
    console.error('Verify license error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTierFeatures(tier: string) {
  const features: Record<string, any> = {
    FREE: {
      daily_limit: 10,
      unlimited_messages: false,
      ai_enabled: false,
      ai_daily_limit: 0,
      ai_monthly_limit: 0,
      priority_support: false,
      campaign_tracking: false
    },
    PRO: {
      daily_limit: 500,
      unlimited_messages: false,
      ai_enabled: true,
      ai_daily_limit: 5,
      ai_monthly_limit: 50,
      priority_support: true,
      campaign_tracking: true
    },
    PREMIUM: {
      daily_limit: 999999,
      unlimited_messages: true,
      ai_enabled: true,
      ai_daily_limit: 20,
      ai_monthly_limit: 200,
      priority_support: true,
      campaign_tracking: true
    }
  };
  
  return features[tier] || features.FREE;
}
