"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { completePayPal } from "@/lib/actions/checkout";
import { toast } from "sonner";


export const dynamic = "force-dynamic";
export default function PayPalSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const [orderId, setOrderId] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (!orderId) return;
    const url = new URL(window.location.href);
    const paypalOrderId = url.searchParams.get("token");
    if (!paypalOrderId) {
      setStatus("error");
      setError("Missing PayPal order ID");
      return;
    }
    const fd = new FormData();
    fd.append("orderId", orderId);
    fd.append("paypalOrderId", paypalOrderId);
    completePayPal(fd).then((res) => {
      if (res.error) {
        setStatus("error");
        setError(res.error);
        toast.error(res.error);
      } else {
        setStatus("success");
        toast.success("Payment confirmed");
      }
    });
  }, [orderId]);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="h-10 w-10 mx-auto text-primary-700 animate-spin" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-slate-600">This usually takes a few seconds.</p>
        </Card>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <XCircle className="h-9 w-9" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Payment couldn&apos;t be confirmed</h1>
          <p className="mt-2 text-sm text-slate-600">{error || "Please contact support if you were charged."}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild><Link href="/dashboard/orders"><span>My orders</span></Link></Button>
            <LinkButton href="/contact" variant="outline">Contact support</LinkButton>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">PayPal payment confirmed</h1>
        <p className="mt-2 text-slate-600">Your expert has been notified and will start your project shortly.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <Link href={`/dashboard/orders/${orderId}`}>
              <span className="inline-flex items-center gap-2">
                View order <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
          <LinkButton href="/dashboard/orders" variant="outline">All orders</LinkButton>
        </div>
      </Card>
    </main>
  );
}
