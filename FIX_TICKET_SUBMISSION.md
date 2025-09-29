# 🔧 Fix Ticket Submission Issue

## ❌ **Problem Identified:**
```
Database error: infinite recursion detected in policy for relation "profiles"
```

The issue is caused by **Row Level Security (RLS) policies** that create infinite recursion when querying the `profiles` table within policies on the same table.

---

## ✅ **SOLUTION (Choose One):**

### **Option 1: Quick Database Fix (Recommended)**

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Fix Script**
   - Copy and paste the contents of `QUICK_DATABASE_FIX.sql`
   - Click "Run" to execute

3. **Verify Environment Variables**
   - Ensure `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
   - This allows the API to bypass RLS when needed

4. **Test the Fix**
   ```bash
   node test-ticket-creation.js
   ```

### **Option 2: API-Level Fix (Already Applied)**

The tickets API has been updated to use the **service role key** to bypass RLS issues:

```typescript
// Uses service role client for database operations
const serviceSupabase = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

## 🧪 **Testing Steps:**

### **1. Start Development Server**
```bash
npm run dev
```

### **2. Test Ticket Creation**
```bash
node test-ticket-creation.js
```

### **3. Test in Browser**
1. Go to `http://localhost:3000/auth/register`
2. Register a new user
3. Navigate to dashboard
4. Try creating a ticket

---

## 🔍 **Verification Checklist:**

- [ ] Database fix script executed successfully
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- [ ] Development server restarted after changes
- [ ] Test script shows "✅ SUCCESS: Ticket created successfully!"
- [ ] Ticket creation works in browser interface

---

## 🛠️ **Environment Variables Required:**

Make sure your `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← IMPORTANT!
GROQ_API_KEY=your_groq_api_key
```

**Where to find Service Role Key:**
1. Supabase Dashboard → Settings → API
2. Copy the "service_role" key (not the anon key)

---

## 🎯 **What the Fix Does:**

### **Database Level:**
- Removes recursive RLS policies
- Creates simple, non-recursive policies
- Allows service role to bypass RLS

### **API Level:**
- Uses service role key for database operations
- Maintains user authentication checks
- Bypasses RLS recursion issues

---

## 🚀 **Expected Results After Fix:**

### **✅ Working Features:**
- ✅ Ticket creation (text and voice input)
- ✅ AI classification working
- ✅ User authentication
- ✅ Role-based access
- ✅ Dashboard functionality

### **📊 Success Indicators:**
- No more "infinite recursion" errors
- Tickets appear in database
- API returns 200 status codes
- Dashboard shows created tickets

---

## 🔧 **Troubleshooting:**

### **If Still Not Working:**

1. **Check Service Role Key**
   ```bash
   # Test if service role key works
   curl -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
        -H "apikey: YOUR_SERVICE_ROLE_KEY" \
        "https://YOUR_PROJECT.supabase.co/rest/v1/profiles"
   ```

2. **Verify Database Connection**
   - Check Supabase project is active
   - Verify database URL is correct
   - Ensure no network issues

3. **Clear Cache and Restart**
   ```bash
   rm -rf .next
   npm run dev
   ```

4. **Check Browser Console**
   - Look for JavaScript errors
   - Check network tab for failed requests

---

## 📞 **Support:**

If the issue persists:

1. **Check Logs:**
   - Browser console errors
   - Terminal output from `npm run dev`
   - Supabase dashboard logs

2. **Verify Setup:**
   - All environment variables set
   - Database schema applied
   - Service role permissions correct

3. **Test Individual Components:**
   - Authentication: Can you log in?
   - Database: Can you query profiles?
   - API: Do other endpoints work?

---

## 🎉 **Success Message:**

When working correctly, you should see:

```
✅ SUCCESS: Ticket created successfully!
📋 Ticket Details:
   ID: 12345678-1234-1234-1234-123456789012
   Title: Test Ticket Creation
   Priority: medium
   Category: technical
   Status: open

🎉 Database fix successful! Tickets are now working.
```

---

**Status: 🔧 FIXABLE - Follow the steps above to resolve the issue**