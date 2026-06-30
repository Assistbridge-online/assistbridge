import { Mail, Cookie, BarChart3, Settings, Users, Shield, RefreshCw, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Cookie Policy" };

const sections = [
  {
    icon: Cookie,
    title: "What Are Cookies?",
    body: "Small text files your browser stores so the site can remember you between visits. Most websites use them — they are not dangerous.",
  },
  {
    icon: Settings,
    title: "Essential Cookies",
    body: "Keep you signed in and protect against fraud. These cannot be disabled because the site won't work without them.",
  },
  {
    icon: BarChart3,
    title: "Analytics Cookies",
    body: "We use Plausible Analytics, which is privacy-friendly and does not use cookies or collect personal data. No tracking across sites, no Google ads following you around.",
  },
  {
    icon: Settings,
    title: "Functional Cookies",
    body: "Remember your preferences (language, theme, dashboard layout) for a more personalized experience. Optional but helpful.",
  },
  {
    icon: Users,
    title: "Third-Party Cookies",
    body: "Stripe and PayPal set cookies during checkout to process payments securely. Cloudflare sets a few for security. We never use advertising or cross-site tracking cookies.",
  },
  {
    icon: Shield,
    title: "Your Choices",
    body: "You can decline non-essential cookies from our banner, or block cookies in your browser settings. Note that blocking essential cookies will break core functionality (sign-in, checkout).",
  },
  {
    icon: RefreshCw,
    title: "Updates",
    body: "We may update this policy occasionally. Changes will be reflected on this page with an updated Last updated date.",
  },
  {
    icon: MessageCircle,
    title: "Contact",
    body: "Questions? Reach us at info@assistbridge.online.",
  },
];

export default function CookiesPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Legal</p>
              <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Cookie Policy
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>Last updated <strong className="text-slate-700 font-semibold">January 2026</strong></span>
              <span className="text-slate-300">·</span>
              <span><strong className="text-slate-700 font-semibold">2 min</strong> read</span>
            </div>
          </div>
          <p className="mt-5 text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl">
            The short version: we use a few cookies to make the site work and to count visits
            (privately). We do not use advertising cookies, and you can opt out anytime.
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
                      <p className="text-sm font-bold tracking-tight text-slate-900">Questions?</p>
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
                  This page explains how AssistBridge uses cookies and similar technologies. By
                  using our site, you agree to our use of cookies as described below.
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Manage your cookies</p>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  You can change your cookie preferences anytime from our cookie banner, or
                  email us at{" "}
                  <a href="mailto:info@assistbridge.online" className="text-white font-semibold underline underline-offset-4 hover:text-emerald-200">
                    info@assistbridge.online
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
