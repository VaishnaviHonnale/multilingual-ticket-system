# 🔑 How to Get a Valid Groq API Key

## ❌ **Current Issue:**
```
Groq API error: 401 {"error":{"message":"Invalid API Key"}}
```

Your Groq API key is either:
- Not set correctly in `.env.local`
- Expired or invalid
- Has extra spaces or characters

---

## ✅ **How to Get a New Groq API Key:**

### **Step 1: Visit Groq Console**
Go to: **[https://console.groq.com](https://console.groq.com)**

### **Step 2: Sign Up / Log In**
- **Sign up** with your email or Google account
- **Verify your email** if required
- **Log in** to the Groq Console

### **Step 3: Create API Key**
1. **Navigate to API Keys** section
2. **Click "Create API Key"**
3. **Give it a name** (e.g., "Multilingual Ticket System")
4. **Copy the API key** immediately (you won't see it again!)

### **Step 4: Update Your .env.local**
Open your `.env.local` file and update:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

**Important:**
- ✅ No spaces before or after the key
- ✅ No quotes around the key
- ✅ Copy the entire key starting with `gsk_`

### **Step 5: Restart Your Server**
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

---

## 🔍 **Verify Your API Key:**

### **Test with cURL:**
```bash
curl "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

If valid, you'll get a response. If invalid, you'll get a 401 error.

---

## 🆓 **Groq Free Tier:**

Groq offers a **generous free tier**:
- **Free API access** for development
- **Fast inference** (faster than OpenAI)
- **Multiple models** available
- **No credit card required** for basic usage

---

## 🔧 **Common Issues & Fixes:**

### **Issue 1: "Invalid API Key"**
**Fix:**
- Get a new API key from console.groq.com
- Make sure you copied the entire key
- Check for extra spaces in `.env.local`

### **Issue 2: "Rate Limit Exceeded"**
**Fix:**
- Wait a few minutes
- Groq has generous limits, but they exist
- Consider upgrading if needed

### **Issue 3: "Model Not Found"**
**Fix:**
- We're using `llama-3.1-8b-instant` (current model)
- Check Groq docs for available models
- Update model name if needed

---

## 📝 **Your .env.local Should Look Like:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Groq AI Configuration (GET THIS FROM console.groq.com)
GROQ_API_KEY=gsk_1234567890abcdefghijklmnopqrstuvwxyz

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

---

## 🚀 **After Getting New API Key:**

1. **Update `.env.local`** with new key
2. **Restart server**: `npm run dev`
3. **Test chatbot** in your dashboard
4. **Should work perfectly!** ✅

---

## 🎯 **Alternative: Use Fallback Mode**

If you don't want to use Groq API right now, the system has **smart fallback responses**:

### **To Use Fallback Mode:**
In `.env.local`, either:
- Remove the `GROQ_API_KEY` line
- Or set it to: `GROQ_API_KEY=your_groq_api_key`

The chatbot will still work with pre-programmed responses for common questions!

---

## 📞 **Need Help?**

### **Groq Support:**
- **Documentation**: [https://console.groq.com/docs](https://console.groq.com/docs)
- **Discord**: Join Groq community
- **Email**: Check Groq website for support

### **Quick Test:**
After updating your API key, test with:
```bash
node test-chat.js
```

---

## ✅ **Checklist:**

- [ ] Signed up at console.groq.com
- [ ] Created new API key
- [ ] Copied entire key (starts with `gsk_`)
- [ ] Updated `.env.local` file
- [ ] No extra spaces or quotes
- [ ] Restarted development server
- [ ] Tested chatbot in dashboard

---

**Once you have a valid API key, your chatbot will provide intelligent, context-aware responses powered by Groq's fast AI models!** 🤖✨

---

*Last Updated: Now*
*Status: Waiting for valid Groq API key*