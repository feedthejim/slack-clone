/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cacheComponents: true,
    clientSegmentCache: true,
    routerBFCache: true,
  },
};

export default nextConfig;
