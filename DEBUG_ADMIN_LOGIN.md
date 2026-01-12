# 🔍 Debug Admin Login - Step by Step

## Step 1: Check if Admin User Exists in Database

Go to Supabase → **Table Editor** → Find `admin_users` table

**Do you see a row with email `contato@lkdigital.org`?**

- ✅ **YES** → Go to Step 2
- ❌ **NO** → The INSERT didn't work. Try this:

```sql
-- Delete any existing admin and insert fresh
DELETE FROM admin_users WHERE email = 'contato@lkdigital.org';

INSERT INTO admin_users (email, password_hash, name)
VALUES (
  'contato@lkdigital.org',
  '$2b$10$i8mvMn2XPOH314J2HYfVqueN8Fu0AqHTW0V60PiKA9N53tz9zefAC',
  'Admin LK Digital'
);

-- Verify
SELECT * FROM admin_users;
```

---

## Step 2: Check Browser Console for Errors

1. Open your admin page: `/admin` (or `http://localhost:3000/admin` if local)
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Try to login
5. Look for **red error messages**

**Copy any error messages you see and send them to me.**

Common errors:
- ❌ `Failed to fetch` → API route not working
- ❌ `500 Internal Server Error` → Server/database issue
- ❌ `401 Unauthorized` → Wrong credentials or user not found
- ❌ `Cannot read property of undefined` → Code bug

---

## Step 3: Check Network Requests

With Developer Tools still open:

1. Click on the **Network** tab
2. Try to login again
3. Look for a request to `/api/admin/login`
4. Click on it
5. Check the **Response** tab

**What does the response say?**

Common responses:
```json
{"error": "Email ou senha incorretos"}  ← User not found or wrong password
{"error": "Email e senha são obrigatórios"}  ← Form validation failed
{"success": true, "token": "..."}  ← Login successful!
```

---

## Step 4: Verify Environment Variables

Check your `.env.local` file has these:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Test Supabase connection:**

```sql
-- Run this in Supabase SQL Editor to test
SELECT current_database(), current_user;
```

If this fails, your Supabase credentials are wrong.

---

## Step 5: Test Locally First

If you're testing on Vercel and getting errors:

1. **Test locally first:**
   ```bash
   cd "C:\dev\Protocolo Receita Oculta\protocoloreceitaoculta"
   npm run dev
   ```

2. Go to `http://localhost:3000/admin`

3. Try login with:
   - Email: `contato@lkdigital.org`
   - Password: `K5h3s2#195962`

4. Check terminal for any errors

---

## Step 6: Check if bcrypt is Installed

The admin login uses `bcryptjs` for password hashing. Verify it's installed:

```bash
cd "C:\dev\Protocolo Receita Oculta\protocoloreceitaoculta"
npm list bcryptjs
```

Should show: `bcryptjs@2.x.x`

If not installed:
```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

---

## Step 7: Test Password Hash Manually

Let's verify the password hash is correct. Run this in your terminal:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.compare('K5h3s2#195962', '$2b$10$i8mvMn2XPOH314J2HYfVqueN8Fu0AqHTW0V60PiKA9N53tz9zefAC').then(result => console.log('Password match:', result));"
```

Should output: `Password match: true`

If it says `false`, the hash is wrong.

---

## Step 8: Generate Fresh Password Hash

If the hash is wrong, let's create a new one:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('K5h3s2#195962', 10).then(hash => console.log('New hash:', hash));"
```

Copy the new hash and update the SQL:

```sql
UPDATE admin_users 
SET password_hash = 'PASTE_NEW_HASH_HERE'
WHERE email = 'contato@lkdigital.org';
```

---

## Step 9: Check API Route Logs

If you're on Vercel:

1. Go to Vercel Dashboard
2. Select your project
3. Click **Logs** (top menu)
4. Filter by `/api/admin/login`
5. Try login again
6. Check for error logs

---

## Step 10: Simplified Test - Direct API Call

Test the API directly using your browser console:

```javascript
// Open your site, press F12, paste this in Console:
fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'contato@lkdigital.org',
    password: 'K5h3s2#195962'
  })
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

**What does it output?**

---

## 🆘 Quick Fixes

### Fix 1: Reset Everything

```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;
CREATE POLICY "Service role can manage admin_users" ON admin_users FOR ALL USING (true);

INSERT INTO admin_users (email, password_hash, name)
VALUES (
  'contato@lkdigital.org',
  '$2b$10$i8mvMn2XPOH314J2HYfVqueN8Fu0AqHTW0V60PiKA9N53tz9zefAC',
  'Admin LK Digital'
);

SELECT * FROM admin_users;
```

### Fix 2: Disable RLS Temporarily (TESTING ONLY)

```sql
-- TEMPORARY - for debugging only
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
```

Try login again. If it works, RLS was the issue.

Then re-enable:
```sql
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

---

## 📋 Send Me This Info

Please provide:

1. ✅ **Does the admin_users table exist?** (Yes/No)
2. ✅ **Does it have a row with email contato@lkdigital.org?** (Yes/No)
3. ✅ **What error message do you see on the login form?**
4. ✅ **What's in the browser console?** (Press F12 → Console tab)
5. ✅ **What's the API response?** (F12 → Network tab → /api/admin/login → Response)
6. ✅ **Are you testing locally or on Vercel?**
7. ✅ **Does bcryptjs package exist?** Run `npm list bcryptjs`

With this info, I can pinpoint the exact issue! 🎯
