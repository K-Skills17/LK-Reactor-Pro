# 🔧 TROUBLESHOOTING: LEADS NOT SAVING TO SUPABASE

## ❌ **PROBLEM IDENTIFIED:**

Your landing page form was **NOT calling the analytics tracking functions** that save leads to the `leads` table in Supabase!

**Root Cause:**
- `app/page.tsx` did NOT import tracking functions from `lib/analytics.ts`
- Form only sent data to Make.com webhook
- No data was being saved to Supabase `leads` table

---

## ✅ **FIXED - WHAT I CHANGED:**

### **1. Added Analytics Import**
```typescript
// app/page.tsx (line 30)
import { trackLeadStep1, trackLeadStep2, trackLeadCompleted } from '@/lib/analytics';
```

### **2. Updated handleNext() to Track Step 1 & 2**
```typescript
const handleNext = async () => {
  if (currentStep === 1 && !validateStep1()) return;
  if (currentStep === 2 && !validateStep2()) return;

  // Track analytics when moving to next step
  if (currentStep === 1) {
    trackLeadStep1({ totalPatients, ticketMedio, inactivePercent, lostRevenue });
  } else if (currentStep === 2) {
    trackLeadStep2({ clinicName, name, email, whatsapp });
  }

  setDirection('forward');
  setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
};
```

### **3. Updated submitDiagnostic() to Track Completion**
```typescript
const submitDiagnostic = async () => {
  setIsSubmitting(true);
  try {
    // ✅ NEW: Track lead completion in Supabase
    await trackLeadCompleted({
      clinicName, name, email, whatsapp,
      totalPatients, ticketMedio, inactivePercent, lostRevenue
    });

    // Also send to Make.com webhook (existing)
    const response = await fetch('/api/submit-diagnostic', { ... });
    
  } catch (error) {
    console.error('Error submitting diagnostic:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🚀 **DEPLOYED TO PRODUCTION**

The fix has been:
- ✅ Committed to GitHub
- ✅ Pushed to main branch
- ✅ Vercel is redeploying automatically

**Wait 2-3 minutes for Vercel deployment to complete.**

---

## 📋 **STEP 1: VERIFY DATABASE MIGRATIONS ARE RUN**

Before testing, you MUST ensure the `leads` table exists in Supabase!

### **Check if `leads` Table Exists:**

1. Open **Supabase** → Your Project → **SQL Editor**
2. Run this query:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'leads'
);
```

**Expected Result:**
```
exists
------
 true
```

### **If Result is `false` (table doesn't exist):**

You need to run the migration! Go to **SQL Editor** and run:

```sql
-- Analytics and Tracking Tables

-- Page Views Tracking
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_page_path ON page_views(page_path);

-- Lead Capture Tracking (Form Submissions)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  clinic_name TEXT,
  name TEXT,
  email TEXT,
  whatsapp TEXT,
  total_patients INTEGER,
  ticket_medio NUMERIC(10,2),
  inactive_percent INTEGER,
  lost_revenue NUMERIC(10,2),
  status TEXT DEFAULT 'completed', -- 'started', 'step1', 'step2', 'completed', 'abandoned'
  abandoned_at_step INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_leads_session ON leads(session_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- Download Tracking
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  email TEXT,
  plan_type TEXT NOT NULL, -- 'free', 'professional', 'premium'
  license_key TEXT,
  source_page TEXT, -- '/setup', '/precos', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_downloads_session ON downloads(session_id);
CREATE INDEX idx_downloads_plan_type ON downloads(plan_type);
CREATE INDEX idx_downloads_email ON downloads(email);
CREATE INDEX idx_downloads_created_at ON downloads(created_at);

-- Conversion Events (for Facebook Pixel)
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL, -- 'Lead', 'CompleteRegistration', 'Purchase'
  event_value NUMERIC(10,2) DEFAULT 0,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversion_events_session ON conversion_events(session_id);
CREATE INDEX idx_conversion_events_name ON conversion_events(event_name);
CREATE INDEX idx_conversion_events_created_at ON conversion_events(created_at);

-- Payment Events
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  email TEXT,
  plan_type TEXT,
  amount NUMERIC(10,2),
  status TEXT NOT NULL, -- 'initiated', 'completed', 'failed'
  payment_provider TEXT DEFAULT 'mercadopago',
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_events_session ON payment_events(session_id);
CREATE INDEX idx_payment_events_status ON payment_events(status);
CREATE INDEX idx_payment_events_created_at ON payment_events(created_at);

-- Disable RLS (service-role only access from backend)
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE downloads DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events DISABLE ROW LEVEL SECURITY;
```

Click **Run** → Should see "Success. No rows returned."

---

## 🧪 **STEP 2: TEST THE FIX**

### **Option A: Test on Production (Vercel)**

1. Wait for Vercel deployment to finish (check Vercel dashboard)
2. Go to: `https://your-vercel-domain.vercel.app/`
3. Fill out the 3-step form:
   - **Step 1**: Total patients, ticket médio, inactive %
   - **Step 2**: Clinic name, your name, email, WhatsApp
   - **Step 3**: View results page

4. Open **Supabase** → **Table Editor** → **leads** table
5. You should see a NEW row with:
   - ✅ `status = 'completed'`
   - ✅ Your clinic name, name, email, whatsapp
   - ✅ `completed_at` timestamp
   - ✅ All business data filled

### **Option B: Test Locally**

1. Run: `npm run dev`
2. Go to: `http://localhost:3000/`
3. Fill out the 3-step form
4. Check Supabase `leads` table
5. Should see new row

---

## 🔍 **STEP 3: VERIFY DATA IN SUPABASE**

Run this query in Supabase SQL Editor:

```sql
-- Get most recent leads
SELECT 
  clinic_name,
  name,
  email,
  whatsapp,
  total_patients,
  lost_revenue,
  status,
  created_at,
  completed_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Output:**
```
clinic_name  | name         | email           | whatsapp       | total_patients | lost_revenue | status    | created_at           | completed_at
-------------|--------------|-----------------|----------------|----------------|--------------|-----------|---------------------|-------------------
Clínica XYZ  | João Silva   | joao@email.com  | +5511987654321 | 500            | 15000.00     | completed | 2026-01-13 01:45:23 | 2026-01-13 01:45:45
```

---

## 📊 **WHAT NOW TRACKS:**

### **Step 1 Completion** (`trackLeadStep1`)
- Fires when: User clicks "Próximo" after filling business data
- Saves to: `leads` table with `status='step1'`
- Data: `totalPatients`, `ticketMedio`, `inactivePercent`, `lostRevenue`

### **Step 2 Completion** (`trackLeadStep2`)
- Fires when: User clicks "Próximo" after filling contact info
- Updates: Same row with `status='step2'`
- Data: `clinicName`, `name`, `email`, `whatsapp`

### **Step 3 - Lead Completed** (`trackLeadCompleted`)
- Fires when: User reaches Step 3 (results page)
- Updates: Same row with `status='completed'` + `completed_at` timestamp
- Also sends:
  - ✅ Facebook Pixel "Lead" event (browser-side)
  - ✅ Facebook CAPI "Lead" event (server-side)
  - ✅ Make.com webhook (if configured)

---

## 🎯 **CONVERSION FUNNEL:**

Now you can track where users drop off:

```sql
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM leads
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'started' THEN 1
    WHEN 'step1' THEN 2
    WHEN 'step2' THEN 3
    WHEN 'completed' THEN 4
  END;
```

**Example Output:**
```
status    | count | percentage
----------|-------|------------
step1     |   100 |   40.00%
step2     |    80 |   32.00%
completed |    70 |   28.00%
```

---

## 🆘 **IF STILL NOT WORKING:**

### **Issue 1: No rows appear in `leads` table**

**Possible Causes:**
1. **Database migration not run** → Run the SQL above
2. **Vercel deployment not finished** → Wait 2-3 minutes
3. **API route failing** → Check Vercel logs

**Check Vercel Logs:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click latest deployment → Runtime Logs
3. Look for errors like:
   ```
   Error: relation "leads" does not exist
   ```
   → This means migration not run!

### **Issue 2: Rows appear with `status='step1'` but not `completed`**

**Possible Cause:** User didn't reach Step 3

**Solution:** Make sure to fill ALL fields and reach the results page

### **Issue 3: Error in console: "Failed to track lead"**

**Possible Cause:** Supabase environment variables not set

**Check:**
1. Vercel → Settings → Environment Variables
2. Verify these exist:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### **Issue 4: `session_id` is NULL or missing**

**Possible Cause:** Session ID not being generated

**Check Browser Console:**
```javascript
// Should see session ID in localStorage
localStorage.getItem('sessionId')
```

If NULL → Clear browser cache and try again

---

## ✅ **SUCCESS CRITERIA:**

After the fix, you should have:

- [x] Code deployed to Vercel
- [ ] `leads` table exists in Supabase
- [ ] Test form submission creates row in `leads`
- [ ] Row has `status='completed'`
- [ ] Row has `completed_at` timestamp
- [ ] All form data is populated
- [ ] Facebook Pixel fires (check console)
- [ ] Facebook CAPI receives event (check Vercel logs)

---

## 📞 **NEXT STEPS:**

1. **Run the database migration** (if not done)
2. **Wait for Vercel deployment** (2-3 minutes)
3. **Test the form** on production
4. **Check Supabase** for the new lead row
5. **Report back** if you see the data!

---

## 🎊 **ONCE WORKING:**

Your lead tracking will be fully operational:
- ✅ All form submissions save to Supabase
- ✅ Admin dashboard shows real data
- ✅ Facebook tracking works
- ✅ Conversion funnel visible
- ✅ No more missing leads!

Let me know what you see after running the migration and testing! 🚀
