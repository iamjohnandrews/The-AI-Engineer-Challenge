/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: We're using Next.js API routes instead of rewrites for better control
  // The API route at /app/api/chat/route.ts handles proxying to the backend
};

module.exports = nextConfig;

