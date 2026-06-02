/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    typescript: {
      ignoreBuildErrors: true,
    },
    // This tells Next.js to ignore ESLint warning rules during builds
    eslint: {
      ignoreDuringBuilds: true,
    },
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
