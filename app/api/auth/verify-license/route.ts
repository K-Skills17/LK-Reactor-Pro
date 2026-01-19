import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
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
    let { data: subscription, error: subError } = await supabaseAdmin
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

    // Check if subscription has expired and has a pending downgrade/change
    const now = new Date();
    if (subscription.current_period_end && new Date(subscription.current_period_end) < now && (subscription as any).next_tier) {
      const nextTier = (subscription as any).next_tier;
      const nextCycle = (subscription as any).next_billing_cycle || 'monthly';
      
      console.log(`🔄 Applying pending plan change: ${subscription.tier} -> ${nextTier}`);
      
      // Calculate new period dates
      const newPeriodEnd = new Date(now);
      if (nextCycle === 'yearly') {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      } else {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      }

      await supabaseAdmin.from('clinics').update({ tier: nextTier }).eq('id', clinic.id);
      const { data: updatedSub } = await supabaseAdmin
        .from('subscriptions')
        .update({
          tier: nextTier,
          billing_cycle: nextCycle,
          current_period_start: now.toISOString(),
          current_period_end: newPeriodEnd.toISOString(),
          next_tier: null,
          next_billing_cycle: null,
          status: nextTier === 'FREE' ? 'cancelled' : 'active',
          updated_at: now.toISOString()
        } as any)
        .eq('id', subscription.id)
        .select()
        .single();
      
      if (updatedSub) {
        subscription = updatedSub;
        clinic.tier = nextTier;
      }
    }
    
    // Check if subscription is active
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
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

    // Get monthly usage (from first day of current month)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const monthStart = firstDayOfMonth.toISOString().split('T')[0];
    
    const { data: monthlyUsageData } = await supabaseAdmin
      .from('usage_tracking')
      .select('messages_sent, ai_generations, campaigns_created')
      .eq('clinic_id', clinic.id)
      .gte('date', monthStart);

    const monthlyUsage = (monthlyUsageData || []).reduce(
      (acc, curr) => ({
        messages_sent: acc.messages_sent + (curr.messages_sent || 0),
        ai_generations: acc.ai_generations + (curr.ai_generations || 0),
        campaigns_created: acc.campaigns_created + (curr.campaigns_created || 0),
      }),
      { messages_sent: 0, ai_generations: 0, campaigns_created: 0 }
    );
    
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
        campaigns_created_today: usage?.campaigns_created || 0,
        messages_sent_this_month: monthlyUsage.messages_sent,
        ai_generations_this_month: monthlyUsage.ai_generations,
        campaigns_created_this_month: monthlyUsage.campaigns_created
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
      monthly_limit: 300,
      unlimited_messages: false,
      ai_enabled: false,
      ai_daily_limit: 0,
      ai_monthly_limit: 0,
      priority_support: false,
      campaign_tracking: false
    },
    PRO: {
      daily_limit: 50, // Capped to ensure monthly limit of 500 is respected and avoid spam
      monthly_limit: 500,
      unlimited_messages: false,
      ai_enabled: true,
      ai_daily_limit: 5,
      ai_monthly_limit: 50,
      priority_support: true,
      campaign_tracking: true
    },
    PREMIUM: {
      daily_limit: 999999,
      monthly_limit: 999999,
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
