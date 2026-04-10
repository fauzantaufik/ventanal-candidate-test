import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // hono v4 is ESM-only; transpile it so webpack can bundle it in the
  // server (CJS) context without splitting it into unreachable chunks.
  transpilePackages: ['hono'],
};

export default nextConfig;
