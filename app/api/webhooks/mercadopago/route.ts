import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('📥 Mercado Pago webhook received:', JSON.stringify(body, null, 2));
    
    // Only process payment notifications
    if (body.type !== 'payment') {
      console.log('ℹ️ Ignoring non-payment notification:', body.type);
      return NextResponse.json({ received: true });
    }
    
    const paymentId = body.data?.id;
    
    if (!paymentId) {
      console.error('❌ No payment ID in webhook');
      return NextResponse.json({ received: true, error: 'No payment ID' });
    }
    
    // Fetch payment details from Mercado Pago API
    const paymentDetails = await fetchPaymentDetails(paymentId);
    
    if (!paymentDetails) {
      console.error('❌ Failed to fetch payment details');
      return NextResponse.json({ received: true, error: 'Failed to fetch payment' });
    }
    
    console.log('💳 Payment details:', {
      id: paymentDetails.id,
      status: paymentDetails.status,
      amount: paymentDetails.transaction_amount,
      external_reference: paymentDetails.external_reference
    });
    
    // Only process approved payments
    if (paymentDetails.status !== 'approved') {
      console.log(`⏳ Payment not approved (status: ${paymentDetails.status})`);
      return NextResponse.json({ received: true });
    }
    
    const clinicId = paymentDetails.external_reference;
    const amount = paymentDetails.transaction_amount;
    
    if (!clinicId) {
      console.error('❌ No external_reference (clinic ID) in payment');
      return NextResponse.json({ received: true, error: 'No clinic ID' });
    }
    
    // Determine tier and billing cycle from amount
    const { tier, billingCycle } = getTierFromAmount(amount);
    
    if (!tier) {
      console.error(`❌ Unknown payment amount: R$${amount}`);
      return NextResponse.json({ received: true, error: 'Unknown amount' });
    }
    
    console.log(`✅ Activating ${tier} (${billingCycle}) for clinic ${clinicId}`);
    
    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date(now);
    
    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }
    
    // Update subscription status to active (using upsert to handle new subscriptions or upgrades)
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        clinic_id: clinicId,
        tier,
        status: 'active',
        billing_cycle: billingCycle,
        mercadopago_payment_id: paymentId,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        next_tier: null,
        next_billing_cycle: null,
        cancel_at_period_end: false,
        updated_at: now.toISOString()
      }, { onConflict: 'clinic_id' }) as any;
    
    if (subError) {
      console.error('❌ Error updating subscription:', subError);
      // Try a regular update if upsert with clinic_id conflict doesn't work as expected
      await supabaseAdmin
        .from('subscriptions')
        .update({
          tier,
          status: 'active',
          billing_cycle: billingCycle,
          mercadopago_payment_id: paymentId,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          next_tier: null,
          next_billing_cycle: null,
          cancel_at_period_end: false,
          updated_at: now.toISOString()
        })
        .eq('clinic_id', clinicId);
    }
    
    // Update clinic tier
    const { error: clinicError } = await supabaseAdmin
      .from('clinics')
      .update({ 
        tier,
        updated_at: now.toISOString()
      })
      .eq('id', clinicId);
    
    if (clinicError) {
      console.error('❌ Error updating clinic tier:', clinicError);
      // Don't throw - subscription is already activated
    }
    
    // Get clinic info for logging/email
    const { data: clinic } = await supabaseAdmin
      .from('clinics')
      .select('email, name, clinic_name')
      .eq('id', clinicId)
      .single();
    
    console.log(`🎉 SUCCESS! Activated ${tier} subscription for:`, {
      clinic_id: clinicId,
      email: clinic?.email,
      name: clinic?.name || clinic?.clinic_name,
      tier,
      billing_cycle: billingCycle,
      amount,
      period_end: periodEnd.toISOString()
    });
    
    // TODO: Send activation email to clinic.email
    // await sendActivationEmail(clinic.email, clinic.name, tier, licenseKey);
    
    return NextResponse.json({ 
      received: true, 
      processed: true,
      clinic_id: clinicId,
      tier,
      status: 'activated'
    });
    
  } catch (error: any) {
    console.error('💥 Webhook processing error:', error);
    return NextResponse.json({ 
      received: true, 
      error: error.message 
    });
  }
}

async function fetchPaymentDetails(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ Missing MERCADOPAGO_ACCESS_TOKEN environment variable');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      console.error('❌ Mercado Pago API error:', response.status, response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    return null;
  }
}

function getTierFromAmount(amount: number): { tier: string; billingCycle: string } {
  // Match payment amounts to tiers and billing cycles
  const amountMap: Record<number, { tier: string; billingCycle: string }> = {
    197: { tier: 'PRO', billingCycle: 'monthly' },
    1970: { tier: 'PRO', billingCycle: 'yearly' },
    497: { tier: 'PREMIUM', billingCycle: 'monthly' },
    4970: { tier: 'PREMIUM', billingCycle: 'yearly' }
  };
  
  return amountMap[amount] || { tier: '', billingCycle: 'monthly' };
}
