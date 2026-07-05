import Link from "next/link";
import { Mail, UserCheck, Briefcase, CreditCard, Copyright, AlertCircle, Scale, LogOut, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Terms of Service", description: "Terms of Service for using AssistBridge. Eligibility, payments, disputes, and more." };

const sections = [
  {
    icon: UserCheck,
    title: "Eligibility & Accounts",
    body: "You must be at least 18 to use AssistBridge. You are responsible for keeping your account information accurate and for safeguarding your password. Notify us right away if you notice any unauthorized activity on your account.",
  },
  {
    icon: Briefcase,
    title: "How the Service Works",
    body: "AssistBridge is a marketplace. We connect clients with independent expert contractors and handle the matching, payment processing, and dispute resolution. The experts themselves deliver the work — we just make the connection safe and smooth.",
  },
  {
    icon: CreditCard,
    title: "Quotes, Payment & Refunds",
    body: "When you approve a quote, you authorize us to charge your payment method. Funds are held in escrow until you approve the delivered work (or 7 days after delivery, whichever comes first). All payments go through Stripe or Paystack — we never see your card details.",
    link: { href: "/refund", label: "See our Refund Policy" },
  },
  {
    icon: Copyright,
    title: "Ownership & IP",
    body: "You own the content you upload. Once an expert is fully paid, the delivered work becomes yours. AssistBridge retains rights only to the platform itself (the name, logo, and software).",
  },
  {
    icon: AlertCircle,
    title: "Prohibited Use",
    body: "Don't use AssistBridge for anything illegal, to pay experts off-platform, to harass anyone, or to submit work as your own to a university where that's prohibited. We may suspend accounts that violate these rules.",
  },
  {
    icon: Scale,
    title: "Liability & Disputes",
    body: "We work hard to keep the platform running and safe, but we can't guarantee uninterrupted service. Our total liability is capped at the greater of what you paid us in the past 12 months or USD $100. Disputes go through binding arbitration.",
  },
  {
    icon: LogOut,
    title: "Termination & Changes",
    body: "You can close your account anytime. We may suspend accounts that violate these Terms. We may also update these Terms occasionally — material changes will be communicated by email or in-app notification.",
  },
  {
    icon: MessageCircle,
    title: "Contact",
    body: "Questions about these Terms? Reach us at info@assistbridge.online and we will get back to you within one business day.",
  },
];

export default function TermsPage() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Legal</p>
              <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Terms of Service
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>Last updated <strong className="text-slate-700 font-semibold">January 2026</strong></span>
              <span className="text-slate-300">·</span>
              <span><strong className="text-slate-700 font-semibold">5 min</strong> read</span>
            </div>
          </div>
          <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl">
            The rules that govern your use of AssistBridge. We have written them in plain
            English wherever possible, but the short version is: be reasonable, pay
            experts, and we will do the same.
          </p>
        </div>
      </section>

      {/* ===================== BODY ===================== */}
      <section>
        <div className="container-x py-10 md:py-14">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Sidebar TOC */}
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
                      <p className="text-sm font-bold tracking-tight text-slate-900">Questions?</p>
                      <a href="mailto:info@assistbridge.online" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                        info@assistbridge.online →
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </aside>

            {/* Main content */}
            <div className="lg:col-span-9 order-1 lg:order-2">
              <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight">
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  These Terms of Service (&quot;Terms&quot;) govern your access to and use of the services
                  provided by AssistBridge LLC. By creating an account or using our website,
                  you agree to be bound by these Terms.
                </p>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {sections.map((s, i) => {
                  const Icon = s.icon;
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
                      {s.link && (
                        <p className="pl-11 mt-2">
                          <Link
                            href={s.link.href}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            {s.link.label} →
                          </Link>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 p-5 rounded-2xl bg-slate-900 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Questions or concerns</p>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  We are happy to clarify anything in these Terms. Email us at{" "}
                  <a href="mailto:info@assistbridge.online" className="text-white font-semibold underline underline-offset-4 hover:text-emerald-200">
                    info@assistbridge.online
                  </a>
                  {" "}and we will get back to you within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
