import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Turns unauthenticated visitors away from the admin before a page renders.
 *
 * This is the optimistic check only — it verifies the cookie's signature but
 * touches no database. Every admin route re-checks the session server-side and
 * every write re-checks it again, so a forged or replayed cookie gets nothing.
 *
 * Runs on the Node.js runtime (Next.js 16 removed edge support for proxy),
 * which is what lets it share the same `jose` verification as the app.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await verifySessionToken(token);

  // Redirect page loads only. A server action arrives as a POST, and
  // redirecting it leaves the form stuck on "Saving…" with no explanation —
  // the session may simply have expired mid-edit. Letting it through costs
  // nothing: every action re-verifies the session itself and returns a
  // message the UI can show, so the write is still refused.
  const isNavigation = request.method === "GET" || request.method === "HEAD";

  if (!user && isNavigation && pathname.startsWith("/admin") && !isLogin) {
    const to = request.nextUrl.clone();
    to.pathname = "/admin/login";
    to.search = "";
    return NextResponse.redirect(to);
  }

  if (user && isLogin && isNavigation) {
    const to = request.nextUrl.clone();
    to.pathname = "/admin";
    to.search = "";
    return NextResponse.redirect(to);
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/admin")) {
    // Belt and braces alongside the headers in next.config.ts.
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
