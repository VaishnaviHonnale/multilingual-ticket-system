# 💻 PowerShell Commands for Deployment

## 🔧 **How to Run Scripts in PowerShell:**

In PowerShell, you need to use `.\` before script names:

```powershell
# ✅ Correct
.\DEPLOY_FINAL.bat

# ❌ Wrong
DEPLOY_FINAL.bat
```

---

## 🚀 **Quick Deployment Commands:**

### **Deploy to Netlify:**
```powershell
# Push to GitHub (Netlify auto-deploys)
git push origin main
```

### **Check Status:**
```powershell
# Check git status
git status

# View recent commits
git log --oneline -5

# Check remote
git remote -v
```

### **Run Deploy Scripts:**
```powershell
# Final deployment script
.\DEPLOY_FINAL.bat

# Push to Netlify
.\push-to-netlify.bat

# Deploy now
.\deploy-now.bat
```

---

## 📊 **Your Current Status:**

### **✅ What's Done:**
- All code errors fixed
- Changes committed to Git
- Pushed to GitHub
- Netlify should be building now

### **⏳ What's Next:**
1. Go to [app.netlify.com](https://app.netlify.com)
2. Check your deployment status
3. Wait for build to complete (3-5 minutes)
4. Add environment variables
5. Test your live site

---

## 🌐 **Check Netlify Deployment:**

### **Option 1: Web Dashboard**
Visit: **[https://app.netlify.com](https://app.netlify.com)**
- Click your site
- Go to "Deploys" tab
- Watch build progress

### **Option 2: Netlify CLI**
```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Check status
netlify status

# View recent deploys
netlify deploy:list
```

---

## 🔑 **After Build Succeeds:**

### **1. Add Environment Variables:**

Go to Netlify Dashboard → Site Settings → Environment Variables

Add these:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY
```

### **2. Redeploy:**
```powershell
# In Netlify dashboard, click "Trigger deploy"
# Or use CLI:
netlify deploy --prod
```

### **3. Update Supabase:**
Add your Netlify URL to Supabase redirect URLs

---

## 🎯 **Useful PowerShell Commands:**

### **Git Commands:**
```powershell
# Check current branch
git branch

# View changes
git diff

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

### **Project Commands:**
```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### **File Operations:**
```powershell
# List files
Get-ChildItem

# View file content
Get-Content filename.txt

# Navigate directories
cd folder-name
cd ..

# Current directory
pwd
```

---

## 🚀 **Quick Deploy Checklist:**

- [x] All errors fixed
- [x] Changes committed
- [x] Pushed to GitHub
- [ ] Check Netlify dashboard
- [ ] Wait for build to complete
- [ ] Add environment variables
- [ ] Trigger redeploy
- [ ] Update Supabase URLs
- [ ] Test live site

---

## 📞 **Need Help?**

### **PowerShell Issues:**
```powershell
# If scripts won't run, enable execution:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again:
.\DEPLOY_FINAL.bat
```

### **Git Issues:**
```powershell
# Check if remote is set
git remote -v

# Add remote if missing
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Force push if needed (careful!)
git push -f origin main
```

---

## 🎉 **You're Done!**

Your code is pushed to GitHub. Netlify is building your site right now!

**Go to [app.netlify.com](https://app.netlify.com) to watch your deployment!**

---

**Status: ✅ PUSHED TO GITHUB**
**Next: Monitor Netlify Dashboard**
**ETA: 3-5 minutes**

*Your multilingual ticket system is going live!* 🚀