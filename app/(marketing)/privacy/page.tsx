import Link from "next/link";
import { Mail, FileText, Eye, Users, Lock, Server, Globe, Baby, RefreshCw, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Privacy Policy" };

const sections = [
  {
    icon: FileText,
    title: "What We Collect",
    body: "The basics: your name, email, and password (hashed). Plus profile details you choose to share, order history and messages, and basic device/usage data so the site works. Payment info is handled entirely by Stripe and PayPal — we never see your card details.",
  },
  {
    icon: Eye,
    title: "How We Use It",
    body: "To run the platform, match you with experts, process payments, send you service updates, and improve the product. We only send marketing emails with your consent, and you can unsubscribe at any time. We do not sell your data — not now, not ever.",
  },
  {
    icon: Users,
    title: "Who We Share It With",
    body: "Experts see your name and project details when matched. Our payment and infrastructure partners (Stripe, PayPal, hosting, email) see only what they need to do their job. We will never share your data with advertisers, and we will only disclose to legal authorities when strictly required by law.",
  },
  {
    icon: Server,
    title: "Where It's Stored",
    body: "Our servers are in the US and EU. We use Standard Contractual Clauses and other approved mechanisms to keep your data protected when it crosses borders, in line with GDPR and other privacy laws.",
  },
  {
    icon: Lock,
    title: "How We Protect It",
    body: "TLS encryption in transit, encryption at rest, hashed passwords, role-based access control, and regular security reviews. No system is 100% secure, so please use a strong password and do not share your account.",
  },
  {
    icon: Eye,
    title: "Cookies & Tracking",
    body: "We use cookies for login, preferences, and privacy-friendly analytics (Plausible). We never set advertising cookies without your consent. You can manage your preferences anytime from our cookie banner.",
    link: { href: "/cookies", label: "Read the Cookie Policy" },
  },
  {
    icon: Baby,
    title: "Children's Privacy",
    body: "AssistBridge is for adults. We do not knowingly collect data from anyone under 16. If you believe we have, please contact us and we will delete it.",
  },
  {
    icon: RefreshCw,
    title: "Your Rights & Retention",
    body: "You can access, correct, or delete your data at any time. Account data is kept while your account is active and deleted within 30 days of closure. Financial records are retained for 7 years for tax and accounting purposes. To exercise any of these rights, email us.",
  },
  {
    icon: MessageCircle,
    title: "Contact",
    body: "Questions about your privacy? Email our Data Protection Officer at info@assistbridge.online — we respond within one business day.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Legal</p>
              <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Privacy Policy
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>Last updated <strong className="text-slate-700 font-semibold">January 2026</strong></span>
              <span className="text-slate-300">·</span>
              <span><strong className="text-slate-700 font-semibold">4 min</strong> read</span>
            </div>
          </div>
          <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl">
            How we collect, use, and protect your personal data. Plain English, no hidden
            clauses. The short version: we collect what we need, we never sell it, and you
            can ask us to delete it anytime.
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
                      <p className="text-sm font-bold tracking-tight text-slate-900">Privacy questions?</p>
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
                  AssistBridge LLC operates the website{" "}
                  <Link href="/" className="text-emerald-700 font-semibold underline underline-offset-4 hover:text-emerald-800">
                    assistbridge.online
                  </Link>
                  . This page explains what data we collect when you use the service, what we
                  do with it, and the choices you have.
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Privacy questions or requests</p>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Email our Data Protection Officer at{" "}
                  <a href="mailto:info@assistbridge.online" className="text-white font-semibold underline underline-offset-4 hover:text-emerald-200">
                    info@assistbridge.online
                  </a>
                  . We respond within one business day, and you can request access, correction,
                  or deletion of your data at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
