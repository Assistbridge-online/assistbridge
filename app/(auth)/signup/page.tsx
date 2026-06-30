"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Briefcase,
  GraduationCap,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signUp } from "@/lib/actions/auth";
import { completePendingOrder } from "@/lib/actions/orders";
import type { UserRole } from "@prisma/client";

const signupSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name").max(80),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
    role: z.enum(["CLIENT", "EXPERT"]),
    terms: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupInput = z.infer<typeof signupSchema>;

const passwordStrength = (pwd: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too weak", color: "bg-red-500" },
    1: { label: "Weak", color: "bg-red-500" },
    2: { label: "Fair", color: "bg-amber-500" },
    3: { label: "Good", color: "bg-blue-500" },
    4: { label: "Strong", color: "bg-emerald-500" },
  };
  return { score: score as 0 | 1 | 2 | 3 | 4, ...map[score] };
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingOrderRaw = searchParams.get("pending");
  const returnTo = searchParams.get("returnTo") ?? "/dashboard/orders";
  const [pendingOrder, setPendingOrder] = useState<FormData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ email: string; role: UserRole; orderId?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Parse pending order from URL params
  if (pendingOrderRaw && !pendingOrder) {
    try {
      const params = new URLSearchParams(pendingOrderRaw);
      const fd = new FormData();
      for (const [k, v] of params.entries()) fd.set(k, v);
      setPendingOrder(fd);
    } catch {}
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CLIENT",
      terms: false,
    },
  });

  const password = watch("password") || "";
  const role = watch("role");
  const strength = passwordStrength(password);

  const onSubmit = (values: SignupInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      // If there's a pending order, create it now
      let orderId: string | undefined;
      if (pendingOrder) {
        const orderResult = await completePendingOrder(pendingOrder);
        if (orderResult.ok && orderResult.orderId) {
          orderId = orderResult.orderId;
        }
      }

      setSuccess({ email: result.email, role: result.role, orderId });
    });
  };

  if (success) {
    return (
      <Card className="p-6 sm:p-8 shadow-lg text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {success.orderId ? "Order saved" : "Check your email"}
        </h1>
        {success.orderId ? (
          <>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              We&apos;ve saved your order. We&apos;ve also sent a verification link to{" "}
              <span className="font-semibold text-slate-900">{success.email}</span>. You can continue
              to upload files now and pay after verifying your email.
            </p>
            <div className="mt-6 space-y-2">
              <Button asChild className="w-full" size="lg">
                <Link href={`/dashboard/orders/${success.orderId}/upload`}>
                  <span className="inline-flex items-center gap-2">
                    Continue to upload files <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/dashboard/orders">View all orders</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              We&apos;ve sent a verification link to{" "}
              <span className="font-semibold text-slate-900">{success.email}</span>. Click the
              link to activate your {success.role === "EXPERT" ? "expert" : "client"} account.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Didn&apos;t get the email? Check your spam folder or try again in a few minutes.
            </p>
            <div className="mt-6">
              <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                Back to sign in
              </Button>
            </div>
          </>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Join AssistBridge and get help with any project
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">I want to</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("role", "CLIENT")}
              className={
                "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition " +
                (role === "CLIENT"
                  ? "border-primary-600 bg-primary-50 ring-2 ring-primary-500/30"
                  : "border-slate-300 bg-white hover:border-slate-400")
              }
            >
              <Briefcase
                className={
                  "h-5 w-5 " + (role === "CLIENT" ? "text-primary-700" : "text-slate-500")
                }
              />
              <span className="text-sm font-semibold text-slate-900">Hire an expert</span>
              <span className="text-xs text-slate-500">Get help on a project</span>
            </button>
            <button
              type="button"
              onClick={() => setValue("role", "EXPERT")}
              className={
                "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition " +
                (role === "EXPERT"
                  ? "border-primary-600 bg-primary-50 ring-2 ring-primary-500/30"
                  : "border-slate-300 bg-white hover:border-slate-400")
              }
            >
              <GraduationCap
                className={
                  "h-5 w-5 " + (role === "EXPERT" ? "text-primary-700" : "text-slate-500")
                }
              />
              <span className="text-sm font-semibold text-slate-900">Work as an expert</span>
              <span className="text-xs text-slate-500">Offer your skills</span>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Full name
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              aria-invalid={!!errors.name}
              className="block w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              className="block w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={!!errors.password}
              className="block w-full h-11 pl-10 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={"h-full transition-all " + strength.color}
                  style={{ width: `${((strength.score + 1) / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 w-16 text-right">
                {strength.label}
              </span>
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={!!errors.confirmPassword}
              className="block w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
            {...register("terms")}
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="text-primary-700 hover:underline font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary-700 hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.terms && (
          <p className="-mt-2 text-xs text-red-600">{errors.terms.message}</p>
        )}

        <Button type="submit" loading={pending} className="w-full" size="lg">
          {!pending && <UserPlus className="h-4 w-4" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-700 hover:text-primary-800">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
