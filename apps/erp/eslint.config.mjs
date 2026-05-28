import { globalIgnores } from "eslint/config";
import baseConfig from "@afenda/config/eslint/nextjs";
import boundaries from "eslint-plugin-boundaries";

const config = [
  globalIgnores(["playwright.config.cjs"]),
  ...baseConfig,
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "appRoute", pattern: "src/app/**" },
        { type: "appConfig", pattern: "src/{app-cron,app-env,app-route-state}/**" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          rules: [
            { from: "appRoute", allow: ["appRoute", "appConfig"] },
            { from: "appConfig", allow: ["appConfig"] },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.client.ts", "src/**/*.client.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            "@afenda/db",
            "@afenda/ai",
            "@afenda/workflows",
            "@afenda/auth/server",
          ],
          patterns: ["node:*"],
        },
      ],
    },
  },
];

export default config;
