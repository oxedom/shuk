import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import dotenv from "dotenv";
import { withSentryConfig } from "@sentry/nextjs";

const env = process.env.ENVIRONMENT;
dotenv.config({ path: `./.env.${env}` });

let gitHashBuildIdShort: string;
try {
  gitHashBuildIdShort = Date.now().toString();
} catch (error) {
  // Fallback for environments without git (like Vercel builds)
  gitHashBuildIdShort = Date.now().toString();
}

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*", // TODO: Change to your origin
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "Content-Type, Authorization",
        },
      ],
    },
  ],
  images: {
    remotePatterns: [
      //Google Provier for auth images
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "**",
      },
    ],
  },
  generateBuildId: () => {
    return gitHashBuildIdShort;
  },
  env: {
    NEXT_PUBLIC_BUILD_ID: gitHashBuildIdShort,
  },
};
const withNextIntl = createNextIntlPlugin("./app/i18n/request.ts");

const intlConfig = withNextIntl(nextConfig);
// const watcherConfig = withIntlWatcher(intlConfig)
// module.exports = watcherConfig

export default withSentryConfig(
  async (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
    // const {createIntlWatcher} = await import('intl-watcher')
    // const withIntlWatcher = createIntlWatcher({
    //   dictionaryPaths: ['./app/i18n/dictionarys/en.json', './app/i18n/dictionarys/he.json'],
    // })
    // const watcherConfig = withIntlWatcher(intlConfig)
    return intlConfig;
  },
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "mytraining",

    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
);
