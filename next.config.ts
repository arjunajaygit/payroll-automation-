/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js NOT to bundle pdfkit, preserving its font files
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
