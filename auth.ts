import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
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
      if (!parsed.success) return null;
      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user || !user.hashedPassword) return null;
      const ok = await bcrypt.compare(password, user.hashedPassword);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, allowDangerousEmailAccountLinking: true }));
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(GitHub({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET, allowDangerousEmailAccountLinking: true } as any));
}

// IMPORTANT: session strategy is JWT (set in auth.config.ts), so we do NOT
// need a database adapter here. Keeping PrismaAdapter causes the dashboard
// layout's `auth()` call to hit the DB on every render; if the user table is
// empty (e.g. account created via Neon Auth dashboard) or schema-drifted, the
// adapter silently returns no session and the layout redirects to /login
// even though the JWT is valid. JWT-only is the right model for credentials
// + OAuth-with-allowDangerousEmailAccountLinking.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
});
