import { Mail, Clock, CheckCircle2, XCircle, HelpCircle, RefreshCw, AlertCircle, Scissors, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Refund Policy" };

const sections = [
  {
    icon: Clock,
    title: "14-Day Review Window",
    body: "After an Expert marks your order as delivered, you have 14 days to review the work and decide. Payment is held during this window — nothing releases to the expert until you approve it.",
  },
  {
    icon: CheckCircle2,
    title: "When You Get a Refund",
    body: "Full or partial refunds apply when the delivered work does not match the agreed scope, contains plagiarism or AI content where human work was required, is delivered unreasonably late, or if our dispute mediation finds in your favor.",
  },
  {
    icon: XCircle,
    title: "When You Don't",
    body: "Refunds are not available if you simply changed your mind after downloading, you provided a poor or incomplete brief, you didn't respond to the expert within 14 days, or you already used or distributed the work.",
  },
  {
    icon: HelpCircle,
    title: "How to Request One",
    body: "Open a dispute from the order page in your dashboard within 14 days of delivery. Describe the issue and attach evidence. Our mediation team reviews within 5 business days. If mediation fails, an independent arbitrator has the final say.",
  },
  {
    icon: RefreshCw,
    title: "Processing Time",
    body: "Approved refunds are sent to your original payment method within 5 business days. Your bank may take 5–10 more days to show it on your statement.",
  },
  {
    icon: Scissors,
    title: "Partial Refunds",
    body: "For multi-deliverable projects where some parts are fine and others aren't, we may issue a partial refund proportional to the unsatisfactory work.",
  },
  {
    icon: AlertCircle,
    title: "Expert Cancellations",
    body: "If your expert cancels before delivery, you get a full refund automatically, usually within 3 business days.",
  },
  {
    icon: MessageCircle,
    title: "Contact",
    body: "Questions about a specific refund? Email us at info@assistbridge.online with your order number and we will help.",
  },
];

export default function RefundPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Legal</p>
              <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Refund Policy
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>Last updated <strong className="text-slate-700 font-semibold">January 2026</strong></span>
              <span className="text-slate-300">·</span>
              <span><strong className="text-slate-700 font-semibold">3 min</strong> read</span>
            </div>
          </div>
          <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl">
            We want you to be happy with every order. Here is when refunds apply and how
            to request one — the short version: you have 14 days to review, and we will
            mediate any dispute fairly.
          </p>
        </div>
      </section>

      <section>
        <div className="container-x py-10 md:py-14">
          <div className="grid lg:grid-cols-12 gap-10">
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <Card className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">On this page</p>
                  <ul className="mt-4 space-y-1.5">
                    {sections.map((s, i) => (
                      <li key={s.title}>
                        <a
                          href={`#${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                          className="flex items-baseline gap-2 text-sm text-slate-600 hover:text-emerald-700 transition-colors py-1"
                        >
                          <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight text-slate-900">Need a refund?</p>
                      <a href="mailto:info@assistbridge.online" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                        info@assistbridge.online →
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </aside>

            <div className="lg:col-span-9 order-1 lg:order-2">
              <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight">
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  Every order comes with a 14-day revision window. If something is off, open
                  a dispute and we will mediate within 5 business days. We have laid out the
                  full details below.
                </p>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {sections.map((s, i) => {
                  const id = s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  return (
                    <div key={s.title} id={id} className="scroll-mt-24">
                      <div className="flex items-start gap-3 pb-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 pt-0.5">
                          {s.title}
                        </h2>
                      </div>
                      <p className="text-[15px] text-slate-600 leading-relaxed pl-11">
                        {s.body}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 p-5 rounded-2xl bg-slate-900 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Need help with a refund?</p>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Open a dispute from the order page in your dashboard, or email us at{" "}
                  <a href="mailto:info@assistbridge.online" className="text-white font-semibold underline underline-offset-4 hover:text-emerald-200">
                    info@assistbridge.online
                  </a>
                  {" "}with your order number. We respond within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
