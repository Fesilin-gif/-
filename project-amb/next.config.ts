import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three ships untranspiled ESM addons; Next handles them, but keep the hint explicit.
  transpilePackages: ['three'],
}

export default nextConfig
