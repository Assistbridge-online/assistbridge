import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers: Parameters<typeof NextAuth>[0]["providers"] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) {
        console.log("[auth:credentials] schema reject", {
          issues: parsed.error.issues.map((i) => i.path.join(".")),
        });
        return null;
      }
      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (!user) {
        console.log("[auth:credentials] no user", { email: email.toLowerCase() });
        return null;
      }
      if (!user.hashedPassword) {
        console.log("[auth:credentials] no hashedPassword on user", {
          id: user.id,
          email: user.email,
        });
        return null;
      }
      const ok = await bcrypt.compare(password, user.hashedPassword);
      if (!ok) {
        console.log("[auth:credentials] bcrypt mismatch", { id: user.id });
        return null;
      }
      console.log("[auth:credentials] ok", { id: user.id, role: user.role });
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      // `allowDangerousEmailAccountLinking` isn't on the next-auth v5
      // beta GitHub provider's typings, but it IS a documented top-
      // level provider option in @auth/core. Cast through `unknown`
      // to keep the strict-no-explicit-any rule happy.
    } as unknown as Parameters<typeof GitHub>[0])
  );
}

// IMPORTANT: session strategy is JWT (set in auth.config.ts), so we do NOT
// need a database adapter here. Keeping PrismaAdapter causes the dashboard
// layout's `auth()` call to hit the DB on every render; if the user table is
// empty (e.g. account created via Neon Auth dashboard) or schema-drifted, the
// adapter silently returns no session and the layout redirects to /login
// even though the JWT is valid. JWT-only is the right model for credentials
// + OAuth-with-allowDangerousEmailAccountLinking.
//
// `secret` is REQUIRED for the JWT session strategy in next-auth v5 —
// @auth/core throws MissingSecret("Please define a `secret`") if neither
// AUTH_SECRET nor NEXTAUTH_SECRET is set in the environment. The local
// .env / .env.production.template historically used NEXTAUTH_SECRET (the
// v4 name); v5 prefers AUTH_SECRET. Accept both so existing deployments
// keep working without an env var rename.
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production"
    ? // Dev fallback — generated random secret keeps dev sessions from
      // bleeding across restarts. NOT safe for production. Real prod
      // deployments MUST set AUTH_SECRET (or NEXTAUTH_SECRET) in env.
      crypto.randomBytes(32).toString("hex")
    : undefined);

if (!authSecret && process.env.NODE_ENV === "production") {
  // Fail loud at module load in prod rather than mid-request. Without a
  // secret, @auth/core will throw MissingSecret on the FIRST credential
  // sign-in that needs a fresh JWT — masking it as a generic
  // /api/auth/error "Configuration" page. Better to crash the route
  // handler up front with an actionable message.
  throw new Error(
    "[auth] Missing JWT signing secret. Set AUTH_SECRET (preferred in " +
      "next-auth v5) or NEXTAUTH_SECRET (legacy v4) in your Vercel " +
      "project environment variables (Project → Settings → Environment " +
      "Variables). The app cannot start in production without one.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: authSecret,
  providers,
});
