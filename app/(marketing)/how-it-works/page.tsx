import Link from "next/link";
import {
  ArrowRight, ArrowDown, Shield, Clock, Award, CheckCircle2,
  Search, MessageSquare, CreditCard, FileCheck, Sparkles,
  ClipboardList, Users, Wallet, FileText, HandCoins,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/faq-list";

export const metadata = {
  title: "How It Works - From Request to Delivery",
  description: "A clear, professional process from posting your brief to releasing payment.",
};

const steps = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Post your project",
    short: "Tell us what you need.",
    description:
      "Describe what you need. The task, the deadline, your budget range, any reference materials. The more context you give, the better we can match you with the right expert.",
    actions: ["Fill the request form", "Attach reference files", "Set your budget range"],
    duration: "~5 min",
  },
  {
    n: "02",
    icon: Users,
    title: "Get matched with a vetted expert",
    short: "We hand-pick 1-3 experts.",
    description:
      "We hand-pick 1-3 experts whose skills and availability fit your task. You see their profile, ratings, and a transparent quote, then approve the one you want to work with.",
    actions: ["Review expert profiles", "Compare transparent quotes", "Pick who you want"],
    duration: "Within 4 hours",
  },
  {
    n: "03",
    icon: Wallet,
    title: "Approve and pay securely",
    short: "Funds held in escrow.",
    description:
      "Once you approve the quote, you pay through Stripe or Paystack. Your expert is notified and starts work immediately. We never see your card details.",
    actions: ["Pay via Stripe or Paystack", "Payment held until approval", "Expert starts work"],
    duration: "~2 min",
  },
  {
    n: "04",
    icon: MessageSquare,
    title: "Collaborate and track progress",
    short: "Stay in the loop.",
    description:
      "Message your expert, share files, get draft deliveries, and request revisions. You'll see progress updates in your dashboard so you always know where things stand.",
    actions: ["Message in-platform", "Share files securely", "Get progress updates"],
    duration: "Ongoing",
  },
  {
    n: "05",
    icon: HandCoins,
    title: "Approve and release payment",
    short: "Pay when you are happy.",
    description:
      "When you're happy with the work, approve the final delivery. Payment releases to your expert. You have 14 days to request revisions if anything needs tweaking.",
    actions: ["Review final delivery", "Release payment", "14 days for revisions"],
    duration: "1 click",
  },
];

const trust = [
  { icon: Shield, title: "Payment held until approval", text: "Processed by Stripe or Paystack. Released to the expert only when you approve the work." },
  { icon: Award, title: "Vetted experts", text: "Every expert is interview-screened, credential-checked, and trial-reviewed." },
  { icon: Clock, title: "Fast matching", text: "Most clients are matched within 4 hours. Complex tasks within 24 hours." },
  { icon: Sparkles, title: "14-day revisions", text: "Need a tweak after delivery? Request a revision within 14 days at no extra cost." },
];

const faqs = [
  { id: "faq-1", question: "How long does the whole process take?", answer: "Most tasks are completed within 3 to 7 days. Simple tasks like formatting or short edits can be done in under 24 hours. Complex multi-week projects are quoted with a custom timeline that we agree on upfront before any work begins." },
  { id: "faq-2", question: "How fast will I be matched with an expert?", answer: "Most clients are matched within 4 hours during business hours. Complex or niche tasks may take up to 24 hours. You will get a notification as soon as a match is ready, and you can review the expert's profile before committing." },
  { id: "faq-3", question: "Can I choose which expert works on my project?", answer: "Yes. We share expert profiles with the quote, including their ratings, sample work, and background. You can request a different expert if the first match is not the right fit, at no extra charge." },
  { id: "faq-4", question: "What if I am not satisfied with the work?", answer: "You have a 14-day revision window after delivery to request changes at no extra cost. If we still cannot resolve the issue, our dispute team will mediate and issue a full or partial refund where appropriate." },
  { id: "faq-5", question: "Is my payment information safe?", answer: "Yes. All payments are processed by Stripe and Paystack, both PCI-DSS Level 1 certified. We never see or store your card details. Payment is held until you approve the work, then released to the expert." },
  { id: "faq-6", question: "Can I communicate with my expert directly?", answer: "Yes. Our in-platform messaging supports text, file attachments, and keeps a full record of every interaction for quality and dispute resolution. You can also share additional briefs, reference material, or feedback at any point." },
  { id: "faq-7", question: "Do experts sign NDAs?", answer: "On request. Just mention it in your brief and we will arrange an NDA before any work begins. This is common for sensitive business, medical, or research work." },
  { id: "faq-8", question: "What payment methods do you accept?", answer: "All major credit and debit cards via Stripe (Visa, Mastercard, American Express, Discover). Apple Pay and Google Pay are supported at checkout. Paystack adds local African payment methods like cards, bank transfer, USSD, and mobile money, depending on your country." },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How it works</p>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
                From request to delivery.
                <br />
                In five clear steps.
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
                We have stripped out the friction. No bidding wars, no opaque pricing,
                no disappearing freelancers. Just a clear, professional process that
                respects your time and protects your money.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/calculator">
                    <span className="inline-flex items-center gap-2">
                      Post a project <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing"><span>See pricing</span></Link>
                </Button>
              </div>
            </div>

            {/* Quick step summary card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                The 5-step path
              </p>
              <ol className="mt-4 space-y-3">
                {steps.map((s) => (
                  <li key={s.n} className="flex items-start gap-3">
                    <span className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {s.n}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 leading-tight">{s.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.duration}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TIMELINE (desktop) ===================== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-x pt-12 md:pt-16 pb-4">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Step by step</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Here is exactly what happens after you hit Post a project.
            </h2>
          </div>
        </div>

        <div className="container-x pb-16 md:pb-20">
          {/* Desktop stepper indicator (hidden on mobile) */}
          <div className="hidden lg:block mb-12">
            <div className="relative">
              <div className="absolute top-5 left-[5%] right-[5%] h-px bg-slate-200" aria-hidden="true" />
              <div className="relative grid grid-cols-5 gap-4">
                {steps.map((s) => (
                  <div key={s.n} className="flex flex-col items-center text-center">
                    <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                      {s.n}
                    </div>
                    <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Step {s.n}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900 leading-tight max-w-[12ch]">
                      {s.short}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical stepper with cards (mobile + desktop) */}
          <ol className="space-y-4 lg:space-y-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isLast = i === steps.length - 1;
              return (
                <li key={s.n} className="relative">
                  <div className="grid lg:grid-cols-[80px_1fr] gap-4 lg:gap-6 items-stretch">
                    {/* Number column with vertical connector */}
                    <div className="hidden lg:flex flex-col items-center pt-2">
                      <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {s.n}
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-slate-200 mt-3" aria-hidden="true" />}
                    </div>

                    {/* Mobile-only number bubble */}
                    <div className="lg:hidden flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {s.n}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Step {s.n}
                      </span>
                    </div>

                    {/* Card */}
                    <Card className="p-6 md:p-7">
                      <div className="flex items-start gap-4">
                        <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                              {s.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                              {s.duration}
                            </span>
                          </div>
                          <p className="mt-2 text-base text-slate-600 leading-relaxed">
                            {s.description}
                          </p>
                          <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                            {s.actions.map((a) => (
                              <li key={a} className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle2 className="h-4 w-4 text-slate-900 shrink-0 mt-0.5" strokeWidth={2.5} />
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/calculator">
                <span className="inline-flex items-center gap-2">
                  Start your project <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== PROTECTION ===================== */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Protection</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Protected at every step.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Every part of the process is designed to protect both sides. Your money, your data,
                and your time.
              </p>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              {trust.map((t) => {
                const Icon = t.icon;
                return (
                  <Card key={t.title} className="p-6 hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{t.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t.text}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">FAQ</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Common questions about the process.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Everything you need to know before posting a project. Can not find what you are looking
              for? <Link href="/contact" className="text-slate-900 font-semibold underline underline-offset-2 hover:text-slate-700">Contact our team</Link>.
            </p>
          </div>
          <FaqList faqs={faqs} variant="flat" />
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section>
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900 p-8 md:p-12 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Try it yourself</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  Ready to see how it works for you?
                </h2>
                <p className="mt-4 text-base text-violet-50/90 max-w-xl leading-relaxed">
                  Post your first project in under five minutes. No credit card required, no commitment.
                  Just describe what you need and we will take it from there.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/calculator"
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-violet-900 text-[15px] font-semibold hover:bg-violet-50 transition-colors"
                  >
                    Post a project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/experts"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/30 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                  >
                    Browse experts
                  </Link>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">The path</p>
                  <ol className="mt-4 space-y-3">
                    {steps.slice(0, 3).map((s) => {
                      const Icon = s.icon;
                      return (
                        <li key={s.n} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold leading-tight">{s.title}</div>
                            <div className="text-xs text-violet-200 mt-0.5">{s.duration}</div>
                          </div>
                        </li>
                      );
                    })}
                    <li className="text-sm text-violet-100 pl-11">... and 2 more</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
