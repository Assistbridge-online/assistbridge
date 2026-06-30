import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { OrderUploadClient } from "./client";
import { ArrowRight, FileText, Upload, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderUploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?returnTo=/dashboard/orders/${id}/upload`);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      academicLevel: true,
      attachments: true,
    },
  });

  if (!order) notFound();
  if (order.clientId !== session.user.id) redirect("/dashboard/orders");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to order
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Upload project files</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload any reference materials, briefs, or files your expert will need.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">{order.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {order.service && <span>{order.service.name}</span>}
              {order.academicLevel && <span>· {order.academicLevel.name}</span>}
              {order.subject && <span>· {order.subject}</span>}
              {order.pageCount && <span>· {order.pageCount} pages</span>}
              <span>· {order.deadlineType === "urgent" ? "Urgent" : "Standard"}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(order.quotedPrice ?? 0)}
            </div>
            <div className="text-xs text-slate-500">Quoted price</div>
          </div>
        </div>

        {order.attachmentsUploaded ? (
          <div className="mt-5 p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900">Files uploaded</p>
              <p className="text-sm text-emerald-800 mt-1">
                You can proceed to checkout, or upload additional files.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Upload className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Upload files to continue</p>
              <p className="text-sm text-amber-800 mt-1">
                You must upload at least one file before you can proceed to checkout.
              </p>
            </div>
          </div>
        )}

        <OrderUploadClient
          orderId={order.id}
          existingAttachments={order.attachments.map((a) => ({
            id: a.id,
            name: a.name,
            size: a.size,
            url: a.url,
          }))}
          alreadyUploaded={order.attachmentsUploaded}
        />
      </Card>

      {order.attachmentsUploaded && (
        <div className="flex justify-end">
          <Link
            href={`/dashboard/orders/${order.id}/pay`}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-slate-900 text-white text-[15px] font-semibold hover:bg-primary-800 transition-colors"
          >
            Continue to checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
