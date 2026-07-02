import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Wrap the auth handler with diagnostic logging so we can see exactly
// what the proxy sees on /dashboard hits. Logs go to the Vercel function
// log; remove once login is verified working.
function debugAuth(
  ...args: Parameters<typeof auth>
): ReturnType<typeof auth> {
  const req = args[0] as { nextUrl?: { pathname?: string }; headers?: Headers } | undefined;
  const path = req?.nextUrl?.pathname;
  const cookieHeader = req?.headers?.get?.("cookie") ?? "";
  const hasSessionToken = /authjs\.session-token|__Secure-authjs\.session-token/.test(cookieHeader);
  console.log("[proxy]", {
    path,
    hasSessionToken,
    cookies: cookieHeader.slice(0, 200),
  });
  // @ts-expect-error - passthrough
  return auth(...args);
}

export default debugAuth;

export const config = {
  matcher: ["/dashboard/:path*", "/expert/:path*", "/admin/:path*"],
};
