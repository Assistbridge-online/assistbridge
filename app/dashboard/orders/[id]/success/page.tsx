import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/db";


export const dynamic = "force-dynamic";
export const metadata = { title: "Payment successful" };

export default async function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Payment successful</h1>
        <p className="mt-2 text-slate-600">
          Your payment of <strong>{formatCurrency(order.finalPrice ?? 0, order.currency)}</strong> for{" "}
          <strong>{order.title}</strong> was received.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Your expert will be notified and start working on your project shortly.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <Link href={`/dashboard/orders/${order.id}`}>
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
