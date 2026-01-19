import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Manage Subscription API
 * Handles plan upgrades, downgrades, and cancellations.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, license_key, action, new_tier, new_billing_cycle } = await request.json();

    if (!email || !license_key) {
      return NextResponse.json({ error: 'Email and license key are required' }, { status: 400 });
    }

    // 1. Authenticate clinic
    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .select('*')
      .eq('email', email)
      .eq('license_key', license_key)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Get active subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('clinic_id', clinic.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      return NextResponse.json({ error: 'Error fetching subscription' }, { status: 500 });
    }

    // 3. Handle Actions
    if (action === 'get_info') {
      // Return current status and available links
      return NextResponse.json({
        clinic: {
          name: clinic.name,
          clinic_name: clinic.clinic_name,
          tier: clinic.tier
        },
        subscription: subscription || { tier: 'FREE', status: 'active' },
        links: {
          upgrade_pro_monthly: `${process.env.NEXT_PUBLIC_PRO_SUBSCRIBTION}&external_reference=${clinic.id}`,
          upgrade_pro_yearly: `${process.env.NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY}&external_reference=${clinic.id}`,
          upgrade_premium_monthly: `${process.env.NEXT_PUBLIC_PREMIUM_SUBSCRIBTION}&external_reference=${clinic.id}`,
          upgrade_premium_yearly: `${process.env.NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY}&external_reference=${clinic.id}`,
        }
      });
    }

    if (action === 'downgrade') {
      if (!new_tier) {
        return NextResponse.json({ error: 'New tier is required for downgrade' }, { status: 400 });
      }

      // Logic: Downgrades take effect at the end of the current period
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          next_tier: new_tier,
          next_billing_cycle: new_billing_cycle || 'monthly',
          cancel_at_period_end: new_tier === 'FREE'
        } as any)
        .eq('clinic_id', clinic.id);

      if (updateError) {
        return NextResponse.json({ error: 'Error processing downgrade' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `Seu plano será alterado para ${new_tier} no próximo ciclo de faturamento.` 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('💥 Manage subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
