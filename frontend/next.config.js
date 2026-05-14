/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Add custom webpack configuration if needed
    return config;
  },
};

module.exports = nextConfig;
