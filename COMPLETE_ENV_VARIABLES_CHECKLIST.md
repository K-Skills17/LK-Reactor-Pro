# 🔐 Complete Environment Variables Checklist - PRE-LAUNCH

## ✅ REQUIRED (App Won't Work Without These)

### **Supabase (Database & Auth)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
```
**Used by**: All database operations, license verification, campaign management, analytics

---

### **Admin Dashboard**
```env
ADMIN_DASHBOARD_TOKEN=Your-Secure-Random-Token-Here
```
**Used by**: `/admin` dashboard authentication, analytics API

---

### **Mercado Pago Subscriptions**
```env
NEXT_PUBLIC_PRO_SUBSCRIBTION=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=XXX
NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=XXX
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=XXX
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=XXX
```
**Used by**: Pricing page `/precos`, payment flow

---

### **Facebook Tracking**
```env
NEXT_PUBLIC_FB_PIXEL_ID=1410687670551454
FB_CAPI_ACCESS_TOKEN=EAAMCby...
```
**Used by**: Facebook Pixel client-side tracking, CAPI server-side conversion tracking

---

## ⚠️ CRITICAL FOR DESKTOP APP INTEGRATION

### **Sender Service Authentication**
```env
SENDER_SERVICE_TOKEN=Your-Very-Secure-Random-Token-Min-32-Chars
```
**Used by**: 
- `/api/sender/queue` - Desktop app gets pending messages
- `/api/sender/mark-sent` - Desktop app reports sent messages
- `/api/sender/mark-failed` - Desktop app reports failures
- `/api/auth/verify-license` - Desktop app verifies license

**⚠️ WITHOUT THIS, THE DESKTOP APP CANNOT COMMUNICATE WITH THE WEB APP!**

---

## 🎨 OPTIONAL (But Recommended for Full Features)

### **OpenAI (AI Message Generation)**
```env
OPENAI_API_KEY=sk-proj-...
```
**Used by**: `/api/campaigns/[id]/ai-generate` - AI message creation feature
**If missing**: AI features won't work, but app will function

---

### **Facebook Test Event Code (Testing Only)**
```env
FB_TEST_EVENT_CODE=TEST12345
```
**Used by**: Testing Facebook CAPI without affecting live data
**Optional**: Remove in production or leave for testing

---

## 📋 COMPLETE .env.local Template

```bash
# ============================================
# REQUIRED - Supabase
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://ieujqnaklmbnnah jjobe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# REQUIRED - Admin Dashboard
# ============================================
ADMIN_DASHBOARD_TOKEN=LKReactor2026AdminSecureToken

# ============================================
# REQUIRED - Mercado Pago Subscriptions
# ============================================
NEXT_PUBLIC_PRO_SUBSCRIBTION=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3f6b15eafd8472a97fe7baad51abe44
NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=YOUR_PRO_YEARLY
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=c6030c5ab09840bb9d5bace215ef721a
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=YOUR_PREMIUM_YEARLY

# ============================================
# REQUIRED - Facebook Tracking
# ============================================
NEXT_PUBLIC_FB_PIXEL_ID=1410687670551454
FB_CAPI_ACCESS_TOKEN=EAAMCbyDJRZB4BQS1RfH5ZAiZB5Qt6F4zoCw76ZCN1y7yigFDZAwm5PAZChbZCvrxAlV5bBB9kuLs9jWMZCe83oMsb17ixR8G4hsTMZCCyDehZCD54TghjIkFUXwtWGp5jZB6lZAk1ZCjsO9wWTf92fPXVcP5ZCtSUNqYZA2LQDmAOW8B9jHjYiT3eMdXGMQZBWazcIXdPQZDZD

# ============================================
# CRITICAL - Desktop App Integration
# ============================================
SENDER_SERVICE_TOKEN=Your-Very-Secure-Random-Token-Generate-With-OpenSSL

# ============================================
# OPTIONAL - OpenAI (AI Features)
# ============================================
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE

# ============================================
# OPTIONAL - Testing
# ============================================
FB_TEST_EVENT_CODE=TEST12345
```

---

## 🔍 How to Check if You're Missing Variables

### Option 1: Use Diagnostic Endpoint
Visit: `https://yourdomain.com/api/admin/diagnostic`

### Option 2: Check Locally
```bash
cd "C:\dev\Protocolo Receita Oculta\protocoloreceitaoculta"
cat .env.local | grep -v "^#" | grep -v "^$"
```

### Option 3: Check Vercel Dashboard
Vercel → Your Project → Settings → Environment Variables

---

## ⚠️ CRITICAL SECURITY NOTES

### Never Expose These:
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- ❌ `SENDER_SERVICE_TOKEN` - Desktop app authentication
- ❌ `OPENAI_API_KEY` - Costs money if abused
- ❌ `FB_CAPI_ACCESS_TOKEN` - Can send fake conversions
- ❌ `ADMIN_DASHBOARD_TOKEN` - Admin dashboard access

### Safe to Expose (starts with NEXT_PUBLIC_):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (limited by RLS)
- ✅ `NEXT_PUBLIC_FB_PIXEL_ID`
- ✅ `NEXT_PUBLIC_*_SUBSCRIBTION*` (payment URLs)

---

## 🚀 Pre-Launch Checklist

- [ ] All REQUIRED variables are set
- [ ] `SENDER_SERVICE_TOKEN` is configured (desktop app needs this!)
- [ ] Mercado Pago yearly plan URLs are created and added
- [ ] Facebook CAPI token is from production (not test)
- [ ] Admin dashboard token is strong and secure
- [ ] All variables are added to Vercel
- [ ] Tested diagnostic endpoint shows all green
- [ ] Desktop app can connect and send messages

---

## 🔧 Generate Secure Tokens

### SENDER_SERVICE_TOKEN
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

### ADMIN_DASHBOARD_TOKEN
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## 📞 Need Help?

If you're missing any variables:
1. Check this file for what's needed
2. Use the diagnostic endpoint to see what's missing
3. Generate secure tokens using the commands above
4. Add to both `.env.local` (local) and Vercel (production)
