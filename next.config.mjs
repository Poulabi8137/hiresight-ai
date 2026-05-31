/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb"
    }
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ]
      }
    ];
  }
};

let config = nextConfig;
if (process.env.ANALYZE === "true") {
  const createBundleAnalyzer = (await import("@next/bundle-analyzer")).default;
  config = createBundleAnalyzer({ enabled: true })(nextConfig);
}

if (process.env.SENTRY_DSN) {
  const { withSentryConfig } = await import("@sentry/nextjs");
  config = withSentryConfig(config, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: true,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
  });
}

export default config;
