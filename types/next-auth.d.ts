/**
 * NextAuth module augmentation.
 *
 * The JWT + session callbacks in auth.config.ts write `id` and `role`
 * onto `session.user` and `token`, but NextAuth's built-in types
 * don't know that. Without this augmentation, every consumer of
 * `session.user.role` / `session.user.id` is a type error.
 *
 * Adding this file once fixes the errors across the whole codebase
 * (lib/actions/admin.ts, all /api/admin/* routes, the support
 * server actions, etc.) without touching any of them.
 */
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export {};