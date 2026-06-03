import type { NextConfig } from "next";
import { createAfendaNextConfig } from "@afenda/config/next";

const nextConfig: NextConfig = createAfendaNextConfig({
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
  async redirects() {
    return [
      {
        source: "/solution-console",
        destination: "/lynx",
        permanent: true,
      },
      {
        source: "/solution-console/:path*",
        destination: "/lynx/:path*",
        permanent: true,
      },
    ];
  },
});

export default nextConfig;
