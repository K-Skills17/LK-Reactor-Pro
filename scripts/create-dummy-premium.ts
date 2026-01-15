/**
 * Script to create a dummy premium account for testing
 * Run with: npx tsx scripts/create-dummy-premium.ts
 */

import { supabaseAdmin } from '../lib/supabaseAdmin';
import { generateLicenseKey } from '../lib/license-utils';
import path from 'path';

// Manual environment variable loading if dotenv is missing
try {
  const fs = require('fs');
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=#\s]+)=([^#\s]*)/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
    console.log('📝 Loaded environment from .env.local');
  }
} catch (e) {
  console.warn('⚠️ Could not load .env.local manually:', e);
}

async function createDummyPremium() {
  const dummyData = {
    name: 'Test Premium User',
    email: 'test-premium@example.com',
    phone: '+5511999999999',
    clinicName: 'Test Premium Clinic',
    tier: 'PREMIUM' as const,
    licenseKey: generateLicenseKey()
  };

  console.log('🚀 Creating dummy premium account...');
  console.log('📋 Data:', JSON.stringify(dummyData, null, 2));

  try {
    // 1. Create clinic (delete existing if any to avoid license_key unique constraint issues)
    await supabaseAdmin.from('clinics').delete().eq('email', dummyData.email);

    const { data: clinic, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .insert({
        name: dummyData.name,
        email: dummyData.email,
        phone: dummyData.phone,
        clinic_name: dummyData.clinicName,
        license_key: dummyData.licenseKey,
        tier: dummyData.tier,
        verified_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clinicError) {
      console.error('❌ Error creating clinic:', clinicError);
      return;
    }

    console.log('✅ Clinic created/updated:', clinic.id);

    // 2. Create/Update subscription
    // First delete existing to avoid duplicate issues and constraints
    await supabaseAdmin.from('subscriptions').delete().eq('clinic_id', clinic.id);

    const { error: subError } = await supabaseAdmin
      .from('subscriptions' as any)
      .insert({
        clinic_id: clinic.id,
        tier: dummyData.tier,
        status: 'active',
        billing_cycle: 'yearly',
        amount: 497,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      });

    if (subError) {
      console.warn('⚠️ Subscription error (this table might not exist yet):', subError.message);
    } else {
      console.log('✅ Subscription activated');
    }

    console.log('\n✨ DUMMY ACCOUNT READY! ✨');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:       ${dummyData.email}`);
    console.log(`🔑 License Key: ${dummyData.licenseKey}`);
    console.log(`🏆 Tier:        ${dummyData.tier}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now use these credentials to log in and test the app.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createDummyPremium();
