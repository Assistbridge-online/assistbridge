"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requestPasswordReset } from "@/lib/actions/auth";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotInput = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(values.email);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      setSentTo(result.email);
    });
  };

  if (sentTo) {
    return (
      <Card className="p-6 sm:p-8 shadow-lg text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          If an account exists for <span className="font-semibold text-slate-900">{sentTo}</span>,
          we&apos;ve sent a password reset link. The link expires in 1 hour.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Didn&apos;t get the email? Check your spam folder, or try again.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="outline" onClick={() => setSentTo(null)} className="w-full">
            Try another email
          </Button>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 shadow-lg">
      <div className="text-center mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the email associated with your account and we&apos;ll send a reset link.
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

        <Button type="submit" loading={pending} className="w-full" size="lg">
          {!pending && <Send className="h-4 w-4" />}
          Send reset link
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-700 hover:text-primary-800"
        >
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
