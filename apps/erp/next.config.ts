import type { NextConfig } from "next";
import { createAfendaNextConfig } from "@afenda/config/next";

const nextConfig: NextConfig = createAfendaNextConfig({
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
