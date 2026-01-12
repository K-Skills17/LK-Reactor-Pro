# 🔧 Fix Admin Login on Vercel

## ✅ What I Fixed

The issue was a **token mismatch**:
- Login API was generating random tokens like `admin_1234567890_xyz`
- Analytics API was expecting a static `ADMIN_DASHBOARD_TOKEN` from environment variables
- They didn't match, so you got "Sessão expirada"

**Now both use the same static token!** ✅

---

## 🎯 What You Need to Do

### Step 1: Add Environment Variable to Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Fill in:
   - **Name**: `ADMIN_DASHBOARD_TOKEN`
   - **Value**: `LKReactor2026SecureAdminToken!@#` (or any secure random string)
   - **Environments**: Check **Production**, **Preview**, **Development**
5. Click **Save**

### Step 2: Generate a Secure Token (Recommended)

Instead of the example above, generate a truly random token:

**Option A - Online:**
- Go to https://randomkeygen.com/
- Copy a **CodeIgniter Encryption Key** (256-bit)

**Option B - Command Line:**
```bash
# On Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy that value and use it as your `ADMIN_DASHBOARD_TOKEN`.

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the **⋮** menu on the latest deployment
3. Click **Redeploy**
4. Wait ~1-2 minutes for deployment to finish

### Step 4: Test Login

1. Go to `https://lk-reactor-pro.vercel.app/admin`
2. **Email**: `contato@lkdigital.org`
3. **Password**: `K5h3s2#195962`
4. Click **"Acessar Dashboard"**

✅ **Should work now!** You'll see the full analytics dashboard.

---

## 🔍 Verify It's Working

After redeployment, visit:
```
https://lk-reactor-pro.vercel.app/api/admin/diagnostic
```

Should show:
```json
{
  "status": "OK",
  "checks": {
    "NEXT_PUBLIC_SUPABASE_URL": true,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": true,
    "SUPABASE_SERVICE_ROLE_KEY": true,
    "ADMIN_DASHBOARD_TOKEN": true,  ← Should be true now!
    "NODE_ENV": "production",
    "VERCEL": true
  },
  "message": "✅ All required environment variables are set"
}
```

---

## 📋 Complete Environment Variables Checklist

Make sure **ALL** these are set in Vercel:

### Supabase (REQUIRED)
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
```

### Admin Dashboard (REQUIRED)
```
✅ ADMIN_DASHBOARD_TOKEN
```

### Mercado Pago (REQUIRED)
```
✅ NEXT_PUBLIC_PRO_SUBSCRIBTION
✅ NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY
✅ NEXT_PUBLIC_PREMIUM_SUBSCRIBTION
✅ NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY
```

### Facebook Tracking (REQUIRED)
```
✅ NEXT_PUBLIC_FB_PIXEL_ID
✅ FB_CAPI_ACCESS_TOKEN
```

### Optional
```
⚪ FB_TEST_EVENT_CODE (for testing)
⚪ OPENAI_API_KEY (for AI features)
⚪ SENDER_SERVICE_TOKEN (for WhatsApp sender)
```

---

## 🎊 What You'll See After Login

Once logged in successfully, your dashboard will show:

### 📊 Overview Stats
- Total & unique visitors
- Completed leads  
- Downloads by plan (FREE/PRO/PREMIUM)
- Total revenue

### 📈 Conversion Funnel
- Visitor → Lead conversion: X%
- Lead → Download conversion: X%
- Download → Payment conversion: X%

### 📥 Downloads Breakdown
- FREE plan: X downloads
- PROFESSIONAL plan: X downloads
- PREMIUM plan: X downloads

### ⚠️ Form Abandonment
- Users who started but didn't finish
- Their email addresses
- When they abandoned

### 📋 Recent Leads
- Full lead details
- Clinic names
- WhatsApp numbers
- Lost revenue calculations

---

## 🔒 Security Note

**Keep your `ADMIN_DASHBOARD_TOKEN` secret!**
- Don't commit it to Git
- Don't share it publicly
- Use a strong random string
- Change it periodically

---

## ✨ After You're Done

Once the admin dashboard is working:

1. ✅ Monitor your conversion funnel daily
2. ✅ Follow up with abandoned leads
3. ✅ Track which plans are most popular
4. ✅ Optimize based on real data
5. ✅ Scale your marketing knowing your metrics

---

**Add `ADMIN_DASHBOARD_TOKEN` to Vercel now and redeploy!** 🚀

After redeploy (1-2 min), try logging in again. It should work! 🎉
