/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js NOT to bundle pdfkit, preserving its font files
  serverExternalPackages: ["pdfkit"],
  devIndicators: {
    appIsrStatus: false, // Hides the static/dynamic routing indicator
    buildActivity: false, // Hides the compiling activity indicator
  },
};

export default nextConfig;
