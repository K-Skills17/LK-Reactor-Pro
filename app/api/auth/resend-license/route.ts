import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateLicenseKey } from '@/lib/license-utils';
import { sendFreeLicenseEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Check if clinic already exists for this email
    const { data: existingClinic } = await supabaseAdmin
      .from('clinics')
      .select('*')
      .eq('email', email)
      .single();

    let clinic = existingClinic;
    let isNew = false;

    if (!existingClinic) {
      // 2. Create new clinic if not found (Trial)
      const licenseKey = generateLicenseKey();
      isNew = true;

      const { data: newClinic, error: clinicError } = await supabaseAdmin
        .from('clinics')
        .insert({
          name: 'Usuário', // Default name if not found in leads
          email: email,
          license_key: licenseKey,
          tier: 'FREE',
          verified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (clinicError) {
        throw clinicError;
      }
      clinic = newClinic;

      // Create FREE subscription (14-day trial)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      await supabaseAdmin
        .from('subscriptions')
        .insert({
          clinic_id: newClinic.id,
          tier: 'FREE',
          status: 'active',
          billing_cycle: 'trial',
          amount: 0,
          current_period_start: new Date().toISOString(),
          current_period_end: trialEndDate.toISOString()
        });
    }

    // 3. Send/Resend email
    if (clinic) {
      await sendFreeLicenseEmail({
        name: clinic.name || 'Usuário',
        email: email,
        clinicName: clinic.clinic_name || 'Sua Clínica',
        licenseKey: clinic.license_key,
        whatsapp: clinic.phone || 'N/A'
      });

      return NextResponse.json({ 
        success: true, 
        message: isNew ? 'Nova chave criada e enviada por email.' : 'Chave existente reenviada por email.' 
      });
    }

    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });

  } catch (error: any) {
    console.error('[Resend License] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
