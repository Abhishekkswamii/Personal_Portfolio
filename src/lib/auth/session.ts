import "server-only";

import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * Sessions are signed, HTTP-only cookies — no server-side session table, and
 * nothing readable by JavaScript in the browser.
 *
 * SameSite=Strict is the CSRF defence for the admin: a cross-site form post
 * simply arrives without the cookie, so it cannot act as you. Server actions
 * additionally verify the Origin header (see `assertSameOrigin`). Strict is
 * acceptable here because nothing links into the admin from elsewhere.
 */

export const SESSION_COOKIE = "portfolio_session";
const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours
const ISSUER = "portfolio";

// Redis has no autoincrement id, and this is a single-admin CMS — the email
// address itself is the identity. Simpler than inventing a numeric id nothing
// else needs.
export type SessionUser = { email: string; name: string | null };

function secret(): Uint8Array | null {
  const value = process.env.AUTH_SECRET ?? "";
  // A short secret is worse than no auth, because it looks like auth.
  if (value.length < 32) return null;
  return new TextEncoder().encode(value);
}

export const isAuthConfigured = () => secret() !== null;

export async function createSession(user: SessionUser): Promise<void> {
  const key = secret();
  if (!key) throw new Error("AUTH_SECRET must be set to at least 32 characters.");

  const token = await new SignJWT({
    email: user.email,
    name: user.name ?? undefined,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** Verifies a token's signature and claims. Returns null for anything invalid. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionUser | null> {
  const key = secret();
  if (!key || !token) return null;

  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: ISSUER,
      algorithms: ["HS256"],
    });
    const email = typeof payload.sub === "string" ? payload.sub : "";
    if (!email) return null;
    return {
      email,
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}

/** The signed-in admin, or null. Never throws. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Defence in depth for server actions. SameSite=Strict already prevents the
 * cookie from being sent cross-site; this rejects a same-site request whose
 * Origin doesn't match the Host, which is the case a proxy misconfiguration
 * could otherwise let through.
 */
export async function assertSameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return true; // same-origin navigations may omit it

  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
