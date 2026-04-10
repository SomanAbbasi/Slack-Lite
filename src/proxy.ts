import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/auth"]);
const isPageRoute = createRouteMatcher(["/(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Always allow Convex Auth endpoints.
  // Convex Auth middleware already knows how to proxy and handle these routes.
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/auth")) {
    return;
  }

  // If the user is already logged in, keep them out of the sign-in page.
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  // If the user is not logged in, they can only access /auth.
  if (
    isPageRoute(request) &&
    !isSignInPage(request) &&
    !(await convexAuth.isAuthenticated())
  ) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }
});

export const config = {
  // The following matcher runs proxy on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};