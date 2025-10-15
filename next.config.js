/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify deployment configuration
  trailingSlash: true,
  
  // Image optimization for static hosting
  images: {
    unoptimized: true,
  },
  
  // Disable telemetry to avoid permission issues
  telemetry: false,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
  
  // Optimize for production
  swcMinify: true,
  reactStrictMode: true,
}

module.exports = nextConfig