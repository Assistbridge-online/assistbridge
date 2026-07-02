"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { signIn } from "@/auth";
import { siteConfig } from "@/lib/site";
import {
  verificationEmailHtml,
  passwordResetEmailHtml,
  welcomeEmailHtml,
} from "@/lib/email-templates";
import type { UserRole } from "@prisma/client";

const signUpSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["CLIENT", "EXPERT"]),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export type ActionResult<T = unknown> =
  | { ok: true } & T
  | { ok: false; error: string };

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Resolve the canonical base URL for absolute links (emails, redirects).
 *
 * Preference order:
 *  1. NEXTAUTH_URL (explicit env, e.g. https://assistbridge.online on Vercel)
 *  2. Live request host, read from `x-forwarded-host` (Vercel) then `host`
 *  3. localhost:3000 (dev fallback)
 *
 * Reading from the request headers is the safety net when NEXTAUTH_URL is
 * missing, stale, or pointed at a preview branch. We always honour the
 * explicit env first because it's the only signal that says "this is the
 * production canonical host" — request headers can be wrong (e.g. someone
 * hits a preview domain that shouldn't be receiving email links).
 */
async function getBaseUrl(): Promise<string> {
  const explicit = process.env.NEXTAUTH_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  try {
    const h = await headers();
    const fwdHost = h.get("x-forwarded-host");
    const host = h.get("host");
    const proto =
      h.get("x-forwarded-proto") ||
      (host?.startsWith("localhost") ? "http" : "https");
    const chosen = fwdHost || host;
    if (chosen) return `${proto}://${chosen}`;
  } catch {
    // headers() not available (shouldn't happen in a server action, but
    // don't blow up the email send if it does)
  }
  return "http://localhost:3000";
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "EXPERT";
}): Promise<ActionResult<{ email: string; role: UserRole }>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      error: "An account with this email already exists. Try signing in instead.",
    };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  const role: UserRole = parsed.data.role;

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name.trim(),
      hashedPassword,
      role,
      ...(role === "CLIENT"
        ? { clientProfile: { create: {} } }
        : { expertProfile: { create: { status: "PENDING" } } }),
    },
  });

  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const baseUrl = await getBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  try {
    const html = verificationEmailHtml({
      name: user.name || "there",
      verifyUrl,
      siteName: siteConfig.name,
    });
    await sendEmail({
      to: email,
      subject: `Verify your ${siteConfig.name} email`,
      html,
      text: `Hi ${user.name || "there"},\n\nWelcome to ${siteConfig.name}. Please verify your email by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    });

    const welcomeHtml = welcomeEmailHtml({
      name: user.name || "there",
      role,
      siteName: siteConfig.name,
      loginUrl: `${baseUrl}/login`,
    });
    await sendEmail({
      to: email,
      subject: `Welcome to ${siteConfig.name}`,
      html: welcomeHtml,
      text: `Hi ${user.name || "there"},\n\nWelcome to ${siteConfig.name}! Your account has been created. Sign in at ${baseUrl}/login`,
    });
  } catch (err) {
    console.error("[signUp] Failed to send verification email:", err);
  }

  return { ok: true, email, role };
}

export async function loginAction(
  email: string,
  password: string,
  callbackUrl?: string
) {
  try {
    const url = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
      redirectTo: callbackUrl || "/dashboard",
    });
    if (url?.includes("error=")) {
      console.log("[loginAction] signIn returned error url", {
        email: email.toLowerCase().trim(),
        url,
      });
      return { ok: false as const, error: "Invalid email or password." };
    }
    return { ok: true as const };
  } catch (err) {
    // next-auth v5 throws a CredentialsSignin for bad creds and a
    // Configuration error for server-side issues. Log the full shape so we
    // can see in the Vercel function log exactly which one fired.
    console.error("[loginAction] signIn threw", {
      email: email.toLowerCase().trim(),
      errType: (err as { type?: string })?.type,
      errMessage: (err as { message?: string })?.message ?? String(err),
      errName: (err as { name?: string })?.name,
    });
    const t = (err as { type?: string })?.type;
    if (t === "Configuration") {
      return {
        ok: false as const,
        error:
          "Server configuration error. Please contact support if this persists.",
      };
    }
    return { ok: false as const, error: "Invalid email or password." };
  }
}



export async function requestPasswordReset(
  email: string
): Promise<ActionResult<{ email: string }>> {
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const normalizedEmail = parsed.data.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (user) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    const token = generateToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token, expires },
    });

    const resetUrl = `${await getBaseUrl()}/reset-password?token=${token}`;
    try {
      const html = passwordResetEmailHtml({
        name: user.name || "there",
        resetUrl,
        siteName: siteConfig.name,
      });
      await sendEmail({
        to: normalizedEmail,
        subject: `Reset your ${siteConfig.name} password`,
        html,
        text: `Hi ${user.name || "there"},\n\nWe received a request to reset your password. Click the link below to choose a new one (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
      });
    } catch (err) {
      console.error("[requestPasswordReset] Failed to send reset email:", err);
    }
  }

  return { ok: true, email: normalizedEmail };
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request. Please request a new reset link." };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!record || record.expires < new Date()) {
    return {
      ok: false,
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email: record.identifier } });
  if (!user) {
    return { ok: false, error: "We couldn't find an account for this link." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { hashedPassword },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token: record.token } },
  });

  return { ok: true };
}

export async function verifyEmail(
  token: string
): Promise<ActionResult<{ email: string }>> {
  if (!token) {
    return { ok: false, error: "Invalid verification link." };
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return {
      ok: false,
      error: "This verification link is invalid or has expired.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email: record.identifier } });
  if (!user) {
    return { ok: false, error: "We couldn't find an account for this link." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token: record.token } },
  });

  return { ok: true, email: record.identifier };
}
