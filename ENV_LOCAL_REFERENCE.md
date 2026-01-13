# 🚨 CRITICAL: YOUR `.env.local` HAS WRONG VARIABLE NAMES!

## ❌ **PROBLEM FOUND:**

Your `.env.local` file uses **WRONG variable names** for monthly subscriptions!

### **What your CODE expects:**
```bash
NEXT_PUBLIC_PRO_SUBSCRIBTION          # ← Monthly PRO
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION      # ← Monthly PREMIUM
```

### **What you HAVE in `.env.local`:**
```bash
NEXT_PUBLIC_PRO_PAYMENT_URL           # ← WRONG NAME!
NEXT_PUBLIC_PREMIUM_PAYMENT_URL       # ← WRONG NAME!
```

**Result**: Your monthly subscription buttons show `#` instead of payment links! 🛑

---

## ✅ **CORRECTED `.env.local` FILE**

Copy this EXACT content to your `.env.local` file:

```bash
# ==============================================
# SUPABASE CONFIGURATION
# ==============================================
NEXT_PUBLIC_SUPABASE_URL=https://ieujqnaklmbnnahjjobe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldWpxbmFrbG1ibm5haGpqb2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMzYyNTIsImV4cCI6MjA4MzcxMjI1Mn0.Mh4dK0IRLWXbeRH-iI41D945K7zBoByTF3tFrtO1IVI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldWpxbmFrbG1ibm5haGpqb2JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEzNjI1MiwiZXhwIjoyMDgzNzEyMjUyfQ.t-SfJhIgRWP7BTg9Hgb9m7cmqnRLidmi7Z7a4LIjR5I

# ==============================================
# OPENAI CONFIGURATION
# ==============================================
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE

# ==============================================
# MERCADO PAGO CONFIGURATION
# ==============================================
MERCADO_PAGO_PUBLIC_KEY=APP_USR-226b0dfd-56b1-4222-a4a1-ab9c483a54fc
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-2056335680618723-011118-837ea2744b2ffd0ec00fbec979935ab6-332421216

# ==============================================
# SUBSCRIPTION URLS - MONTHLY PLANS
# ==============================================
# PRO Monthly (R$ 197/month) - CORRECT VARIABLE NAME!
NEXT_PUBLIC_PRO_SUBSCRIBTION=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3f6b15eafd8472a97fe7baad51abe44

# PREMIUM Monthly (R$ 497/month) - CORRECT VARIABLE NAME!
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=c6030c5ab09840bb9d5bace215ef721a

# ==============================================
# SUBSCRIPTION URLS - YEARLY PLANS
# ==============================================
# PRO Yearly (R$ 2.128/year = R$ 177/month, save 10%)
NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=8cfc4ae5247d4004bfb919934ce9061f

# PREMIUM Yearly (R$ 3.790/year = R$ 316/month, save 33%)
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2287564f54444214ba0fb2be97f4b613

# ==============================================
# FACEBOOK PIXEL & CAPI
# ==============================================
FB_CAPI_ACCESS_TOKEN=EAAMCbyDJRZB4BQS1RfH5ZAiZB5Qt6F4zoCw76ZCN1y7yigFDZAwm5PAZChbZCvrxAlV5bBB9kuLs9jWMZCe83oMsb17ixR8G4hsTMZCCyDehZCD54TghjIkFUXwtWGp5jZB6lZAk1ZCjsO9wWTf92fPXVcP5ZCtSUNqYZA2LQDmAOW8B9jHjYiT3eMdXGMQZBWazcIXdPQZDZD

# ==============================================
# DESKTOP APP AUTHENTICATION
# ==============================================
# Token for Python sender service to authenticate with API
SENDER_SERVICE_TOKEN=gvCz73dBVM5PY4lxkjRHJyfIEZsb1eXrwSN8L2huKAn9DtqG

# ==============================================
# ADMIN DASHBOARD (if you use admin dashboard)
# ==============================================
ADMIN_DASHBOARD_TOKEN=your_admin_dashboard_token_here

# ==============================================
# OTHER CONFIGURATION
# ==============================================
LICENSE_VERIFY_ENDPOINT=https://hook.us2.make.com/4l7jgxtdlnmjy1b55dj048ccp4byo5x9
API_BASE_URL=http://localhost:3000
```

---

## 📝 **CHANGES YOU NEED TO MAKE:**

### **1. Fix Monthly Subscription Variable Names**

**CHANGE THIS:**
```bash
NEXT_PUBLIC_PRO_PAYMENT_URL=https://...           # ❌ WRONG
NEXT_PUBLIC_PREMIUM_PAYMENT_URL=https://...       # ❌ WRONG
```

**TO THIS:**
```bash
NEXT_PUBLIC_PRO_SUBSCRIBTION=https://...          # ✅ CORRECT
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION=https://...      # ✅ CORRECT
```

**Note**: Yes, it's spelled `SUBSCRIBTION` (not `SUBSCRIPTION`) - this matches your code!

---

### **2. Remove Duplicate `SENDER_SERVICE_TOKEN`**

Keep only ONE:
```bash
SENDER_SERVICE_TOKEN=gvCz73dBVM5PY4lxkjRHJyfIEZsb1eXrwSN8L2huKAn9DtqG
```

Remove the first one (`s2le/O5fMV/...`)

---

### **3. Remove Old Unused Variables**

Delete these lines (not used anywhere):
```bash
NEXT_PUBLIC_PRO_YEARLY_URL=...
NEXT_PUBLIC_PREMIUM_YEARLY_URL=...
NEXT_PUBLIC_PRO_MONTHLY_URL=...
NEXT_PUBLIC_PREMIUM_MONTHLY_URL=...
```

---

## 🚨 **MOST IMPORTANT: ADD TO VERCEL!**

**`.env.local` only works on YOUR COMPUTER for local development!**

**Your production website on Vercel CANNOT see `.env.local`!**

### **After fixing `.env.local`, you MUST add these to Vercel:**

Go to: **Vercel Dashboard → Settings → Environment Variables**

Add these **8 critical variables**:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | (from .env.local) | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from .env.local) | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | (from .env.local) | Supabase dashboard |
| `OPENAI_API_KEY` | (from .env.local) | OpenAI dashboard |
| `MERCADO_PAGO_ACCESS_TOKEN` | (from .env.local) | Mercado Pago |
| `NEXT_PUBLIC_PRO_SUBSCRIBTION` | (from .env.local) | Monthly PRO URL |
| `NEXT_PUBLIC_PREMIUM_SUBSCRIBTION` | (from .env.local) | Monthly PREMIUM URL |
| `NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY` | (from .env.local) | Yearly PRO URL ✅ |
| `NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY` | (from .env.local) | Yearly PREMIUM URL ✅ |
| `SENDER_SERVICE_TOKEN` | (from .env.local) | Desktop app token ✅ |
| `FB_CAPI_ACCESS_TOKEN` | (from .env.local) | Facebook CAPI |
| `ADMIN_DASHBOARD_TOKEN` | (generate new) | Admin login |

---

## ✅ **QUICK FIX STEPS:**

1. **Open `.env.local` in your editor**
2. **Delete everything**
3. **Copy-paste the corrected content above**
4. **Save the file**
5. **Restart your local dev server** (`npm run dev`)
6. **Test locally**: Go to `/precos` and check buttons
7. **Add ALL variables to Vercel**
8. **Redeploy Vercel**

---

## 🧪 **TEST AFTER FIXING:**

### **Test 1: Local Development**
1. Run: `npm run dev`
2. Go to: `http://localhost:3000/precos`
3. Click "Mensal" - PRO button should work ✅
4. Click "Anual" - PRO button should work ✅

### **Test 2: Production (Vercel)**
1. Add all env vars to Vercel
2. Redeploy
3. Go to: `https://your-domain.com/precos`
4. Test all 4 buttons (PRO/PREMIUM, Monthly/Yearly)

---

## 🎯 **SUMMARY:**

| Issue | Status | Fix |
|-------|--------|-----|
| Wrong variable names | 🔴 CRITICAL | Rename to `NEXT_PUBLIC_PRO_SUBSCRIBTION` |
| Duplicate SENDER_SERVICE_TOKEN | 🟡 WARNING | Keep only one |
| Old unused variables | 🟡 WARNING | Delete them |
| Not in Vercel | 🔴 CRITICAL | Add all to Vercel env vars |

**After fixing these 4 issues, you'll be 100% ready to launch!** 🚀
