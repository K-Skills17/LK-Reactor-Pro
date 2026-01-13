# 🔧 Pre-Launch Issues & Fixes

## ✅ GOOD NEWS: Desktop App Integration is SOLID

All sender API routes have proper authentication:
- ✅ `/api/sender/queue` - Protected with Bearer token
- ✅ `/api/sender/mark-sent` - Protected with Bearer token  
- ✅ `/api/sender/mark-failed` - Protected with Bearer token
- ✅ All have `dynamic = 'force-dynamic'` for Vercel
- ✅ All use `SENDER_SERVICE_TOKEN` for authentication

---

## ⚠️ CRITICAL ISSUES FOUND

### 1. **LICENSE VERIFICATION API - MISSING AUTH & DYNAMIC CONFIG**

**File**: `app/api/auth/verify-license/route.ts`

**Issues**:
- ❌ Missing `export const dynamic = 'force-dynamic'`
- ❌ Missing `export const runtime = 'nodejs'`
- ❌ No Bearer token authentication (anyone can call this!)
- ⚠️ Exposes sensitive user data without authentication

**Impact**: HIGH - Desktop app won't work on Vercel, security risk

**Fix**: Add auth + dynamic exports

---

### 2. **MISSING ENVIRONMENT VARIABLE: SENDER_SERVICE_TOKEN**

**Issue**: Desktop app REQUIRES `SENDER_SERVICE_TOKEN` but it's not documented in the summary

**Impact**: HIGH - Desktop app cannot communicate with web app

**Fix**: Already documented in `COMPLETE_ENV_VARIABLES_CHECKLIST.md`

---

### 3. **LOGO SIZE - TOO SMALL**

**Files**: 
- `components/ui/navbar.tsx` - Logo sizing
- `app/page.tsx` - Hero section logo

**Current**: 
- Mobile: `h-12` (48px)
- Desktop: `h-20` (80px)

**Should be**:
- Mobile: `h-16` (64px)  
- Desktop: `h-24` (96px) or `h-28` (112px)

**Impact**: MEDIUM - Logo hard to see, branding issue

---

### 4. **INCONSISTENT FREE PLAN NAMING**

**Issue**: Some places say "FREE", some say "GRÁTIS"

**Files affected**:
- `/obrigado` page - Says "FREE"
- `/precos` page - Says "GRÁTIS"
- Database tier enum - Says "FREE"

**Fix**: Keep database as "FREE", but display as "GRÁTIS" everywhere

---

### 5. **MISSING YEARLY PLAN URLs**

**Issue**: Yearly plan URLs are placeholders

```env
NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY=YOUR_PRO_YEARLY_PLAN_URL_HERE
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY=YOUR_PREMIUM_YEARLY_PLAN_URL_HERE
```

**Impact**: HIGH - Yearly plan buttons won't work

**Fix**: User needs to create yearly plans in Mercado Pago

---

### 6. **WEBHOOK PRICE MAPPING INCOMPLETE**

**File**: `app/api/webhooks/mercadopago/route.ts`

**Issue**: amountMap doesn't have yearly prices (2128, 3790)

**Impact**: HIGH - Yearly subscriptions won't be processed correctly

**Fix**: Add yearly amounts to amountMap

---

## 🔧 FIXES TO IMPLEMENT NOW

### Fix 1: Add Auth & Dynamic Config to License Verification

### Fix 2: Increase Logo Sizes

### Fix 3: Fix Webhook Amount Mapping

### Fix 4: Add Missing Dynamic Exports

---

## ⏳ FIXES REQUIRING USER ACTION

### 1. Create Yearly Subscription Plans in Mercado Pago
- PRO Yearly: R$ 2.128/year
- PREMIUM Yearly: R$ 3.790/year

### 2. Generate SENDER_SERVICE_TOKEN
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

### 3. Add to Vercel Environment Variables
- `SENDER_SERVICE_TOKEN`
- `NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY`
- `NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY`

---

## 📊 SUMMARY

**Critical (Must fix before launch)**: 3
**High (Should fix before launch)**: 2
**Medium (Nice to have)**: 1

**Total Fixes Needed**: 6
**Can be automated**: 4
**Requires user**: 2
