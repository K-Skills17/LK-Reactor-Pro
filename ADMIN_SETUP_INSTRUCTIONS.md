# 🔐 Admin Dashboard Setup Instructions

## ⚠️ Current Issue

You're getting an error when trying to log in because **the admin user doesn't exist in the database yet**.

---

## ✅ **FASTEST FIX: Run SQL in Supabase (Recommended)**

### Step 1: Go to Supabase SQL Editor

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** (left sidebar)
4. Click **"New query"**

### Step 2: Run This SQL

Copy and paste this SQL and click **"Run"**:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can manage admin_users" ON admin_users FOR ALL USING (true);

-- Create index for faster lookups
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Insert your admin user (contato@lkdigital.org)
INSERT INTO admin_users (email, password_hash, name)
VALUES (
  'contato@lkdigital.org',
  '$2b$10$i8mvMn2XPOH314J2HYfVqueN8Fu0AqHTW0V60PiKA9N53tz9zefAC',
  'Admin LK Digital'
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name;
```

### Step 3: Login

1. Go to `https://yourdomain.com/admin`
2. **Email**: `contato@lkdigital.org`
3. **Password**: `K5h3s2#195962`
4. Click **"Acessar Dashboard"**

✅ **You're done!** You should now see the analytics dashboard.

---

## 🔄 **ALTERNATIVE: Use Setup Page (If SQL Doesn't Work)**

### Step 1: Add Environment Variable

Add this to your `.env.local` file:

```env
ADMIN_SETUP_TOKEN=create-a-super-secure-random-token-here-123456789
```

**Generate a secure token:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use this online tool
# https://randomkeygen.com/
```

### Step 2: Add to Vercel (Production)

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add: `ADMIN_SETUP_TOKEN` = (same token as local)
3. **Redeploy**

### Step 3: Access Setup Page

1. Local: `http://localhost:3000/admin/setup`
2. Production: `https://yourdomain.com/admin/setup`

3. Fill in the form:
   - **Setup Token**: Paste your `ADMIN_SETUP_TOKEN`
   - **Name**: `Admin LK Digital`
   - **Email**: `contato@lkdigital.org`
   - **Password**: `K5h3s2#195962`

4. Click **"Criar Admin"**

5. You'll be redirected to `/admin` and can log in!

---

## 🔍 **Troubleshooting**

### Error: "Email ou senha incorretos"

**Cause**: Admin user doesn't exist in database yet.

**Fix**: Run the SQL in Supabase (Step 1 above)

---

### Error: "Erro ao carregar dados"

**Possible causes**:
1. Supabase env variables not set correctly
2. `admin_users` table doesn't exist

**Fix**:
1. Check `.env.local` has:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

2. Run the SQL migration above

---

### Error: "Sessão expirada"

**Cause**: The session token is simple and doesn't persist on server restarts.

**Fix**: Just log in again. The session is stored in `sessionStorage`.

---

## 📊 **What You'll See After Login**

After successful login, you'll see:

✅ **Overview Stats**
- Total visitors (unique/total)
- Completed leads
- App downloads by plan
- Total revenue

✅ **Downloads Breakdown**
- FREE plan downloads
- PROFESSIONAL plan downloads
- PREMIUM plan downloads

✅ **Conversion Funnel**
- Visitors → Leads → Downloads → Payments
- Conversion rates at each stage

✅ **Form Abandonment**
- List of users who started but didn't finish
- Email addresses (if captured)
- Date/time

✅ **Recent Leads**
- Full lead information
- Clinic names, lost revenue calculations
- WhatsApp numbers

---

## 🔒 **Security Notes**

1. **Password Hashing**: Uses bcrypt with 10 salt rounds
2. **Session Tokens**: Random tokens stored in browser sessionStorage
3. **RLS (Row Level Security)**: Enabled on `admin_users` table
4. **Service Role**: Only server-side API routes can access admin data

---

## ✨ **Next Steps**

After setting up admin access:

1. ✅ Log in and verify the dashboard loads
2. ✅ Check that analytics data is tracking correctly
3. ✅ Test Facebook Pixel integration
4. ✅ Monitor conversion rates
5. ✅ Review abandoned leads for follow-up

---

## 🆘 **Still Having Issues?**

If you're still getting errors after running the SQL:

1. **Check Browser Console** (F12 → Console tab)
   - Look for red error messages
   - Copy the full error text

2. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs → API Logs
   - Look for failed requests to `admin_users` table

3. **Verify Table Exists**
   - Go to Supabase → Table Editor
   - Look for `admin_users` table
   - Should have columns: `id`, `email`, `password_hash`, `name`, `created_at`, `last_login`

4. **Test Locally First**
   - Run `npm run dev`
   - Try login at `http://localhost:3000/admin`
   - Check terminal for server errors

Let me know the specific error message and I can help debug further! 🚀
