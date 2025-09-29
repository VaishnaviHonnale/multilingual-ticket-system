#!/usr/bin/env node

/**
 * Setup Verification Script for Multilingual AI Ticket Management System
 * This script verifies that all components are properly configured
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Missing: ${filePath}`, 'red');
    return false;
  }
}

function checkEnvVar(varName, description) {
  // Check .env.local file
  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) {
    log(`❌ .env.local file not found`, 'red');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasVar = envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`);
  
  if (hasVar) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - ${varName} not configured`, 'red');
    return false;
  }
}

function checkPackageJson() {
  const packagePath = 'package.json';
  if (!fs.existsSync(packagePath)) {
    log(`❌ package.json not found`, 'red');
    return false;
  }
  
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    'groq-sdk',
    'i18next',
    'react-i18next',
    'recharts',
    'lucide-react'
  ];
  
  let allDepsPresent = true;
  requiredDeps.forEach(dep => {
    if (!packageContent.dependencies[dep] && !packageContent.devDependencies[dep]) {
      log(`❌ Missing dependency: ${dep}`, 'red');
      allDepsPresent = false;
    }
  });
  
  if (allDepsPresent) {
    log(`✅ All required dependencies present`, 'green');
  }
  
  return allDepsPresent;
}

function main() {
  log('\n🚀 Multilingual AI Ticket Management System - Setup Verification\n', 'cyan');
  
  let allChecksPass = true;
  
  // Check core files
  log('📁 Checking Core Files:', 'blue');
  allChecksPass &= checkFile('package.json', 'Package.json exists');
  allChecksPass &= checkFile('.env.local', 'Environment file exists');
  allChecksPass &= checkFile('next.config.js', 'Next.js config exists') || checkFile('next.config.mjs', 'Next.js config exists');
  
  // Check app structure
  log('\n📱 Checking App Structure:', 'blue');
  allChecksPass &= checkFile('app/layout.tsx', 'Root layout exists');
  allChecksPass &= checkFile('app/page.tsx', 'Home page exists');
  allChecksPass &= checkFile('app/dashboard/page.tsx', 'Dashboard page exists');
  allChecksPass &= checkFile('app/admin/page.tsx', 'Admin page exists');
  allChecksPass &= checkFile('app/auth/login/page.tsx', 'Login page exists');
  allChecksPass &= checkFile('app/auth/register/page.tsx', 'Register page exists');
  
  // Check API routes
  log('\n🔌 Checking API Routes:', 'blue');
  allChecksPass &= checkFile('app/api/tickets/route.ts', 'Tickets API exists');
  allChecksPass &= checkFile('app/api/tickets/classify/route.ts', 'Classification API exists');
  allChecksPass &= checkFile('app/api/chat/route.ts', 'Chat API exists');
  
  // Check components
  log('\n🧩 Checking Components:', 'blue');
  allChecksPass &= checkFile('components/tickets/create-ticket-form.tsx', 'Create ticket form exists');
  allChecksPass &= checkFile('components/speech/speech-to-text.tsx', 'Speech-to-text component exists');
  allChecksPass &= checkFile('components/chat/ai-chatbot.tsx', 'AI chatbot exists');
  allChecksPass &= checkFile('components/admin/admin-dashboard.tsx', 'Admin dashboard exists');
  allChecksPass &= checkFile('components/admin/analytics-overview.tsx', 'Analytics overview exists');
  allChecksPass &= checkFile('components/language-switcher.tsx', 'Language switcher exists');
  
  // Check lib files
  log('\n📚 Checking Library Files:', 'blue');
  allChecksPass &= checkFile('lib/supabase-client.ts', 'Supabase client exists');
  allChecksPass &= checkFile('lib/ai/ticket-classifier.ts', 'AI classifier exists');
  allChecksPass &= checkFile('lib/i18n/config.ts', 'i18n config exists');
  allChecksPass &= checkFile('lib/types.ts', 'Type definitions exist');
  
  // Check database scripts
  log('\n🗄️ Checking Database Scripts:', 'blue');
  allChecksPass &= checkFile('scripts/setup-database.sql', 'Database setup script exists');
  
  // Check environment variables
  log('\n🔐 Checking Environment Variables:', 'blue');
  allChecksPass &= checkEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'Supabase URL configured');
  allChecksPass &= checkEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon key configured');
  allChecksPass &= checkEnvVar('GROQ_API_KEY', 'Groq API key configured');
  
  // Check package dependencies
  log('\n📦 Checking Dependencies:', 'blue');
  allChecksPass &= checkPackageJson();
  
  // Final result
  log('\n' + '='.repeat(60), 'cyan');
  if (allChecksPass) {
    log('🎉 All checks passed! Your setup looks good.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Run: npm run dev', 'yellow');
    log('2. Visit: http://localhost:3000', 'yellow');
    log('3. Create an account or use demo accounts', 'yellow');
    log('4. Test the features!', 'yellow');
  } else {
    log('❌ Some checks failed. Please review the issues above.', 'red');
    log('\nFor help:', 'blue');
    log('- Check SETUP.md for detailed instructions', 'yellow');
    log('- Ensure all files are in place', 'yellow');
    log('- Verify environment variables are set', 'yellow');
  }
  log('='.repeat(60), 'cyan');
  
  process.exit(allChecksPass ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, checkEnvVar, checkPackageJson };