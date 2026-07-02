"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
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

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
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

  const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?token=${token}`;

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
      loginUrl: `${getBaseUrl()}/login`,
    });
    await sendEmail({
      to: email,
      subject: `Welcome to ${siteConfig.name}`,
      html: welcomeHtml,
      text: `Hi ${user.name || "there"},\n\nWelcome to ${siteConfig.name}! Your account has been created. Sign in at ${getBaseUrl()}/login`,
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
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirectTo: callbackUrl || "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    throw error;
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

    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
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
