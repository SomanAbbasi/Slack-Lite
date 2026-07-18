import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/auth"]);
const isPageRoute = createRouteMatcher(["/(.*)"]);

const getSafeReturnTo = (request: Request) => {
  const pathname = new URL(request.url).pathname;
  const search = new URL(request.url).search;
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/";
  }
  if (pathname.startsWith("/auth")) {
    return "/";
  }
  return `${pathname}${search}`;
};

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/auth")) {
    return;
  }

  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    const returnTo = request.nextUrl.searchParams.get("returnTo");
    if (
      returnTo &&
      returnTo.startsWith("/") &&
      !returnTo.startsWith("//") &&
      !returnTo.startsWith("/auth")
    ) {
      return nextjsMiddlewareRedirect(request, returnTo);
    }
    return nextjsMiddlewareRedirect(request, "/");
  }

  if (
    isPageRoute(request) &&
    !isSignInPage(request) &&
    !(await convexAuth.isAuthenticated())
  ) {
    const returnTo = encodeURIComponent(getSafeReturnTo(request));
    return nextjsMiddlewareRedirect(request, `/auth?returnTo=${returnTo}`);
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
