"use client";

import Link from "next/link";
import { XCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";


export const dynamic = "force-dynamic";
export default function PayPalCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
          <XCircle className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">PayPal payment cancelled</h1>
        <p className="mt-2 text-slate-600">No charge was made. You can complete payment anytime from your order page.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild><Link href="/dashboard/orders"><span>My orders</span></Link></Button>
          <LinkButton href="/contact" variant="outline">Need help?</LinkButton>
        </div>
      </Card>
    </main>
  );
}
