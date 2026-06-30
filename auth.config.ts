import type { NextAuthConfig } from "next-auth";

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
        (session.user as { role?: string }).role = (token.role as string) ?? "CLIENT";
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
