import type { NextAuthConfig } from "next-auth";

/**
 * Base auth config — no DB, no Node-only imports.
 *
 * Host detection:
 *  - `trustHost: true` lets NextAuth derive the canonical host from the
 *    request headers (`x-forwarded-host` / `host`), which is what we want
 *    on Vercel where the env var `NEXTAUTH_URL` is sometimes missing,
 *    stale, or pointed at a preview branch.
 *  - In dev we prefer NEXTAUTH_URL (e.g. http://localhost:3000).
 *
 * Cookie config:
 *  - We do NOT set `domain` explicitly. NextAuth will default the cookie
 *    to the request host, which is the only thing that works across
 *    assistbridge.online / www.assistbridge.online / *.vercel.app
 *    previews. Pinning a single domain here is the #1 cause of
 *    "200 OK then silent /login bounce" on Vercel.
 *  - On Vercel (production) the `__Secure-` prefix is added automatically
 *    when `useSecureCookies` resolves true; we follow that signal.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "CLIENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        (session.user as { role?: string }).role =
          (token.role as string) ?? "CLIENT";
      }
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isDashboard = path.startsWith("/dashboard");
      const isExpert = path.startsWith("/expert");
      const isAdmin = path.startsWith("/admin");
      if (!isDashboard && !isExpert && !isAdmin) return true;
      if (!auth?.user) return false;
      const role = (auth.user as { role?: string }).role;
      if (isAdmin) return role === "ADMIN";
      if (isExpert) return role === "EXPERT" || role === "ADMIN";
      return role === "CLIENT" || role === "ADMIN";
    },
  },
};
