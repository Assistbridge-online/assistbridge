"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Mail, Lock, User, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { registerAfterPayment, confirmVerificationCode, resendVerificationCode } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900">Missing session</h1>
          <p className="mt-2 text-slate-600">No checkout session found. Please start from the calculator.</p>
          <Button asChild className="mt-4"><a href="/calculator">Go to calculator</a></Button>
        </Card>
      </div>
    );
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("All fields are required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);

    const result = await registerAfterPayment(sessionId, name, email, password);
    if (!result.ok) { setError(result.error); setLoading(false); return; }
    setStep("verify");
    setLoading(false);
  }

  async function submitCode(fullCode: string) {
    if (loading) return;
    if (fullCode.length !== 6) { setError("Please enter the full 6-digit code."); return; }
    setLoading(true);
    setError("");

    const result = await confirmVerificationCode(email, fullCode, name, password, sessionId);
    if (!result.ok) {
      setError(result.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      setError("Account created but login failed. Please sign in manually.");
      setLoading(false);
      window.location.href = `/dashboard/orders/${result.orderId}`;
      return;
    }

    window.location.href = `/dashboard/orders/${result.orderId}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitCode(code.join(""));
  }

  function handleChange(i: number, v: string) {
    if (!/^\d*$/.test(v)) return;
    const next = [...code];
    next[i] = v.slice(-1);
    setCode(next);
    if (v && i < 5) {
      const nextInput = document.getElementById(`code-${i + 1}`);
      nextInput?.focus();
    }
    if (v && next.every((d) => d !== "") && !loading) {
      submitCode(next.join(""));
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      const prev = document.getElementById(`code-${i - 1}`);
      prev?.focus();
    }
  }

  async function handleResend() {
    setError("");
    await resendVerificationCode(email);
    setCode(["", "", "", "", "", ""]);
    document.getElementById("code-0")?.focus();
  }

  if (step === "verify") {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-emerald-50/30 to-white px-4 py-16">
        <Card className="w-full max-w-md p-8 shadow-xl text-center">
          <Mail className="h-10 w-10 mx-auto text-emerald-600 mb-3" />
          <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="mt-2 text-slate-600 text-sm">
            We sent a 6-digit code to <strong>{email}</strong>. It expires in 10 minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((d, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Verifying..." : "Verify code and continue"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            Did not receive it?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Resend code
            </button>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-emerald-50/30 to-white px-4 py-16">
      <Card className="w-full max-w-lg p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900">Payment successful!</h1>
        </div>
        <p className="text-slate-600 mb-6">Create your account to access your dashboard and order.</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="John Doe"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Sending code..." : "Create account and verify email"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
        <CheckoutSuccessInner />
      </Suspense>
    </div>
  );
}
