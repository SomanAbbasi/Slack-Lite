import { AuthConfig } from "convex/server";

// CONVEX_SITE_URL is provided automatically on Convex deployments.
// Fallback keeps local tooling working if SITE_URL was set manually.
const convexSiteUrl =
  process.env.CONVEX_SITE_URL ??
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

if (!convexSiteUrl) {
  throw new Error(
    "Missing CONVEX_SITE_URL (or SITE_URL). Run `npx convex env set SITE_URL http://localhost:3000` for local Auth.",
  );
}

export default {
  providers: [
    {
      domain: convexSiteUrl,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
