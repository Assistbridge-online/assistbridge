import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Shield, Clock, Award,
  CheckCircle2, Search, MessageSquare, CreditCard, FileCheck, Sparkles,
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
    icon: FileCheck,
    title: "Post your project",
    description:
      "Describe what you need. The task, the deadline, your budget range, any reference materials. The more context you give, the better we can match you with the right expert.",
    actions: ["Fill the request form", "Attach reference files", "Set your budget range"],
    img: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1000&q=80",
    alt: "Open notebook with a pen and a coffee cup on a wooden desk",
  },
  {
    n: "02",
    icon: Search,
    title: "Get matched with a vetted expert",
    description:
      "We hand-pick 1–3 experts whose skills and availability fit your task. You see their profile, ratings, and a transparent quote, then approve the one you want to work with.",
    actions: ["Review expert profiles", "Compare transparent quotes", "Pick who you want"],
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1000&q=80",
    alt: "Two professionals reviewing project details on a tablet",
  },
  {
    n: "03",
    icon: CreditCard,
    title: "Approve and pay securely",
    description:
      "Once you approve the quote, you pay through Stripe or PayPal. Your expert is notified and starts work immediately. We never see your card details.",
    actions: ["Pay via Stripe or PayPal", "Payment held until approval", "Expert starts work"],
    img: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1000&q=80",
    alt: "Hand holding a credit card over a secure online checkout form",
  },
  {
    n: "04",
    icon: MessageSquare,
    title: "Collaborate and track progress",
    description:
      "Message your expert, share files, get draft deliveries, and request revisions. You'll see progress updates in your dashboard so you always know where things stand.",
    actions: ["Message in-platform", "Share files securely", "Get progress updates"],
    img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1000&q=80",
    alt: "Two people collaborating on a laptop at a wooden desk",
  },
  {
    n: "05",
    icon: CheckCircle2,
    title: "Approve and release payment",
    description:
      "When you're happy with the work, approve the final delivery. Payment releases to your expert. You have 14 days to request revisions if anything needs tweaking.",
    actions: ["Review final delivery", "Release payment", "14 days for revisions"],
    img: "https://images.unsplash.com/photo-1606326608690-4e0281b1e588?w=1000&q=80",
    alt: "Hands signing and stamping a finished document on a desk",
  },
];

const trust = [
  { icon: Shield, bg: "bg-emerald-100 text-emerald-700", title: "Payment held until approval", text: "Processed by Stripe or PayPal. Released to the expert only when you approve the work." },
  { icon: Award, bg: "bg-amber-100 text-amber-700", title: "Vetted experts", text: "Every expert is interview-screened, credential-checked, and trial-reviewed." },
  { icon: Clock, bg: "bg-sky-100 text-sky-700", title: "Fast matching", text: "Most clients are matched within 4 hours. Complex tasks within 24 hours." },
  { icon: Sparkles, bg: "bg-violet-100 text-violet-700", title: "14-day revisions", text: "Need a tweak after delivery? Request a revision within 14 days at no extra cost." },
];

const faqs = [
  { id: "faq-1", question: "How long does the whole process take?", answer: "Most tasks are completed within 3 to 7 days. Simple tasks like formatting or short edits can be done in under 24 hours. Complex multi-week projects are quoted with a custom timeline that we agree on upfront before any work begins." },
  { id: "faq-2", question: "How fast will I be matched with an expert?", answer: "Most clients are matched within 4 hours during business hours. Complex or niche tasks may take up to 24 hours. You will get a notification as soon as a match is ready, and you can review the expert's profile before committing." },
  { id: "faq-3", question: "Can I choose which expert works on my project?", answer: "Yes. We share expert profiles with the quote, including their ratings, sample work, and background. You can request a different expert if the first match is not the right fit, at no extra charge." },
  { id: "faq-4", question: "What if I am not satisfied with the work?", answer: "You have a 14-day revision window after delivery to request changes at no extra cost. If we still cannot resolve the issue, our dispute team will mediate and issue a full or partial refund where appropriate." },
  { id: "faq-5", question: "Is my payment information safe?", answer: "Yes. All payments are processed by Stripe and PayPal, both PCI-DSS Level 1 certified. We never see or store your card details. Payment is held until you approve the work, then released to the expert." },
  { id: "faq-6", question: "Can I communicate with my expert directly?", answer: "Yes. Our in-platform messaging supports text, file attachments, and keeps a full record of every interaction for quality and dispute resolution. You can also share additional briefs, reference material, or feedback at any point." },
  { id: "faq-7", question: "Do experts sign NDAs?", answer: "On request. Just mention it in your brief and we will arrange an NDA before any work begins. This is common for sensitive business, medical, or research work." },
  { id: "faq-8", question: "What payment methods do you accept?", answer: "All major credit and debit cards via Stripe (Visa, Mastercard, American Express, Discover). Also Apple Pay, Google Pay, and PayPal. Local payment methods like iDEAL, SEPA, and BACS are supported where available." },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How it works</p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
              From request to delivery. In five clear steps.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
              We have stripped out the friction. No bidding wars, no opaque pricing, no disappearing
              freelancers. Just a clear, professional process that respects your time and protects your money.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/calculator"><span className="inline-flex items-center gap-2">Post a project <ArrowRight className="h-4 w-4" /></span></Link>
              </Button>
              <Button asChild size="lg" variant="outline"><Link href="/pricing"><span>See pricing</span></Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STEPS ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Step by step</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Here is exactly what happens after you hit Post a project.
            </h2>
          </div>

          <div className="space-y-20">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="grid lg:grid-cols-2 gap-10 items-center"
                >
                  <div className={`relative ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/60">
                      <Image
                        src={s.img}
                        alt={s.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-5 -right-5 lg:-right-6 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200 px-5 py-4 hidden sm:flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${i === 0 ? "bg-emerald-100 text-emerald-700" : i === 1 ? "bg-amber-100 text-amber-700" : i === 2 ? "bg-sky-100 text-sky-700" : i === 3 ? "bg-violet-100 text-violet-700" : "bg-rose-100 text-rose-700"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Step {s.n}</div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">{s.title}</div>
                      </div>
                    </div>
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      <span className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                        {s.n}
                      </span>
                      Step {s.n}
                    </div>
                    <h3 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-4 text-base text-slate-600 leading-relaxed">
                      {s.description}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {s.actions.map((a) => (
                        <li key={a} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
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
              {trust.map((t) => (
                <Card key={t.title} className="p-6 hover:shadow-md transition-shadow">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${t.bg}`}>
                    <t.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{t.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{t.text}</p>
                </Card>
              ))}
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
              for? <Link href="/contact" className="text-emerald-700 font-semibold hover:text-emerald-800">Contact our team</Link>.
            </p>
          </div>
          <FaqList faqs={faqs} variant="flat" />
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section>
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />

            <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Try it yourself</p>
                <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                  Ready to see how it works for you?
                </h2>
                <p className="mt-4 text-base text-slate-300 max-w-xl leading-relaxed">
                  Post your first project in under five minutes. No credit card required, no commitment.
                  Just describe what you need and we will take it from there.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/calculator"
                    className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    Post a project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/experts"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                  >
                    Browse experts
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
                  alt="Person working on a laptop in a focused workspace"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


