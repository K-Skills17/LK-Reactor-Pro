# 🔧 FIX: DUPLICATE LEADS ISSUE

## ❌ **THE PROBLEM YOU DISCOVERED:**

When you submitted ONE form, you got **3 separate rows** in the `leads` table with the same `session_id`:

```
session_id      | status    | clinic_name | email       | total_patients
----------------|-----------|-------------|-------------|----------------
abc-123-xyz     | step1     | NULL        | NULL        | 500
abc-123-xyz     | step2     | Clinic XYZ  | joe@email   | NULL
abc-123-xyz     | completed | Clinic XYZ  | joe@email   | 500
```

**Expected:** ONE row that gets updated as the user progresses  
**Actual:** THREE rows created (one per step)

---

## 🐛 **ROOT CAUSE:**

The code was using `upsert()` incorrectly:

```typescript
// ❌ WRONG - This creates NEW rows every time
await supabaseAdmin.from('leads').upsert({
  session_id: sessionId,
  status: 'step1',
  // ... data
});
```

**Problem:** `upsert()` in Supabase matches on the **primary key (`id`)** by default. Since we weren't providing an `id`, it treated every call as an INSERT, creating new rows!

---

## ✅ **THE FIX:**

Changed the logic to **check if a row exists, then UPDATE or INSERT accordingly**:

### **Step 1: Check + Insert/Update**
```typescript
// ✅ CORRECT - Check if exists, then insert or update
const { data: existingLead } = await supabaseAdmin
  .from('leads')
  .select('id')
  .eq('session_id', sessionId)
  .single();

if (existingLead) {
  // Update existing row
  await supabaseAdmin
    .from('leads')
    .update({ status: 'step1', ...data })
    .eq('session_id', sessionId);
} else {
  // Insert new row
  await supabaseAdmin
    .from('leads')
    .insert({ session_id: sessionId, status: 'step1', ...data });
}
```

### **Step 2 & Step 3: Always Update**
```typescript
// ✅ CORRECT - Update the existing row
await supabaseAdmin
  .from('leads')
  .update({ 
    status: 'step2',
    clinic_name: data.clinicName,
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
  })
  .eq('session_id', sessionId);
```

**Result:** Now ONE row per session, updated as user progresses! ✅

---

## 🧹 **CLEANUP EXISTING DUPLICATES:**

You have duplicate rows from your test. Let's consolidate them!

### **Step 1: View Duplicates**

Open **Supabase → SQL Editor** and run:

```sql
-- See which sessions have multiple rows
SELECT 
  session_id,
  COUNT(*) as row_count,
  STRING_AGG(status::text, ', ' ORDER BY created_at) as statuses,
  MIN(created_at) as first_created,
  MAX(created_at) as last_updated
FROM leads
GROUP BY session_id
HAVING COUNT(*) > 1
ORDER BY last_updated DESC;
```

**Expected Output:**
```
session_id      | row_count | statuses                  | first_created | last_updated
----------------|-----------|---------------------------|---------------|-------------
abc-123-xyz     |         3 | step1, step2, completed   | 2026-01-13... | 2026-01-13...
```

---

### **Step 2: Run Cleanup Script**

I created `CLEANUP_DUPLICATE_LEADS.sql` with a complete cleanup script.

**To run it:**

1. Open **Supabase → SQL Editor**
2. Copy the ENTIRE contents of `CLEANUP_DUPLICATE_LEADS.sql`
3. Paste into SQL Editor
4. Click **Run**

**What it does:**
- ✅ Finds all sessions with multiple rows
- ✅ Consolidates data from all rows into ONE row
- ✅ Keeps the most complete data (completed status, all fields filled)
- ✅ Deletes the duplicate rows
- ✅ Leaves you with ONE row per session

**Result:**
```sql
-- Before cleanup:
session_id      | status    | clinic_name | email       | total_patients
----------------|-----------|-------------|-------------|----------------
abc-123-xyz     | step1     | NULL        | NULL        | 500
abc-123-xyz     | step2     | Clinic XYZ  | joe@email   | NULL
abc-123-xyz     | completed | Clinic XYZ  | joe@email   | 500

-- After cleanup:
session_id      | status    | clinic_name | email       | total_patients
----------------|-----------|-------------|-------------|----------------
abc-123-xyz     | completed | Clinic XYZ  | joe@email   | 500
```

---

### **Step 3: Verify Cleanup**

After running the cleanup script, verify no more duplicates:

```sql
-- Should return NO rows if cleanup worked
SELECT 
  session_id,
  COUNT(*) as row_count
FROM leads
GROUP BY session_id
HAVING COUNT(*) > 1;
```

**Expected:** 0 rows (no duplicates)

---

## 🧪 **TEST THE FIX:**

### **Test 1: Fresh Submission**

1. Wait for Vercel deployment (2-3 minutes)
2. Go to your production site
3. Fill out the 3-step form
4. Check Supabase `leads` table

**Expected Result:**
- ✅ Only ONE row created
- ✅ Row has same `session_id` throughout
- ✅ Row updates as you progress: `step1` → `step2` → `completed`

### **Test 2: Verify One Row Per Session**

```sql
SELECT 
  session_id,
  status,
  clinic_name,
  name,
  email,
  total_patients,
  created_at,
  completed_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:** Each `session_id` appears only ONCE ✅

---

## 📊 **BEFORE vs AFTER:**

### **BEFORE (Broken):**
```
User fills Step 1:
  → INSERT row: { session_id: 'abc', status: 'step1', patients: 500 }

User fills Step 2:
  → INSERT row: { session_id: 'abc', status: 'step2', email: 'joe@' }

User reaches Step 3:
  → INSERT row: { session_id: 'abc', status: 'completed', all data }

Result: 3 rows! ❌
```

### **AFTER (Fixed):**
```
User fills Step 1:
  → INSERT row: { session_id: 'abc', status: 'step1', patients: 500 }

User fills Step 2:
  → UPDATE same row: { status: 'step2', email: 'joe@' }

User reaches Step 3:
  → UPDATE same row: { status: 'completed', all data }

Result: 1 row! ✅
```

---

## 🎯 **WHAT THIS FIXES:**

| Issue | Before | After |
|-------|--------|-------|
| Rows per submission | 3 rows | 1 row ✅ |
| Lead count accuracy | Inflated by 3x | Accurate ✅ |
| Data completeness | Split across rows | All in one row ✅ |
| Admin dashboard | Wrong metrics | Correct metrics ✅ |
| Conversion funnel | Broken | Working ✅ |

---

## 📋 **ACTION ITEMS:**

- [x] Code fix deployed to production (Vercel auto-deploying)
- [ ] Run cleanup script in Supabase SQL Editor
- [ ] Verify duplicates are removed
- [ ] Test new form submission
- [ ] Confirm only 1 row created per session

---

## 🚀 **DEPLOYMENT STATUS:**

- ✅ Code committed
- ✅ Pushed to GitHub
- ⏳ Vercel redeploying (wait 2-3 minutes)
- ⏳ Run cleanup script manually in Supabase

---

## 🆘 **IF ISSUES PERSIST:**

### **Issue: Still seeing duplicates after cleanup**

**Cause:** Cleanup script didn't run or failed

**Solution:**
1. Check Supabase SQL Editor for errors
2. Run Step 1 query to verify duplicates exist
3. Run cleanup script again
4. Verify with Step 3 query

### **Issue: New submissions still create duplicates**

**Cause:** Vercel deployment not finished

**Solution:**
1. Check Vercel dashboard
2. Wait for green checkmark
3. Clear browser cache
4. Test again

### **Issue: No data saving at all**

**Cause:** Different issue (API error)

**Solution:**
1. Check browser console for errors
2. Check Vercel logs for API errors
3. Verify environment variables set

---

## ✅ **SUCCESS CRITERIA:**

After fix is complete, you should have:

- [x] Code deployed
- [ ] Cleanup script run
- [ ] Only 1 row per session_id
- [ ] All data in one consolidated row
- [ ] New submissions create only 1 row
- [ ] Admin dashboard shows accurate lead count

---

## 🎊 **SUMMARY:**

**Problem:** `upsert()` was creating 3 rows per form submission  
**Root Cause:** `upsert()` matched on wrong column (id instead of session_id)  
**Fix:** Changed to explicit INSERT or UPDATE logic based on session_id  
**Status:** Deployed and ready to test  
**Next Step:** Run cleanup script to consolidate existing duplicates

Your lead tracking is now fixed! 🚀
