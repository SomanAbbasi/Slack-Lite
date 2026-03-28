import { AuthConfig } from "convex/server";

const convexSiteUrl =
  process.env.CONVEX_SITE_URL ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

export default {
  providers: [
    {
      domain: convexSiteUrl!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
