import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, Search, Mail, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getActiveFaqs } from "@/lib/content";
import { FaqList } from "@/components/faq-list";

export const metadata = { title: "FAQ", description: "Frequently asked questions about AssistBridge." };

export default async function FAQPage() {
  const faqs = await getActiveFaqs();

  const topics = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Help center</p>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
                Frequently asked questions.
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                Quick answers to the things people ask most. Can&apos;t find what you&apos;re looking
                for? <Link href="/contact" className="text-slate-900 underline underline-offset-4 hover:text-emerald-700 font-medium">Contact us</Link> and
                we&apos;ll get back to you within one business day.
              </p>
            </div>
            <div className="relative h-full min-h-[280px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200/60">
              <Image
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80"
                alt="Person at a desk reviewing notes with a laptop"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TOPIC PILLS ===================== */}
      {topics.length > 0 && (
        <section className="border-b border-slate-200 bg-white">
          <div className="container-x py-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mr-2">Topics</span>
              {topics.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700"
                >
                  {t}
                  <span className="text-slate-400">
                    {faqs.filter((f) => f.category === t).length}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== FAQ LIST + SIDEBAR ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <div className="flex items-baseline gap-3 mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">All questions</p>
                <span className="text-xs text-slate-400">{faqs.length} answers</span>
              </div>
              <FaqList faqs={faqs} variant="grouped" />
            </div>

            <aside className="lg:col-span-4 space-y-4">
              <div className="lg:sticky lg:top-24 space-y-4">
                <Card className="p-5 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-slate-900">Email us</p>
                    <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                      We respond within one business day.
                    </p>
                    <a href="mailto:info@assistbridge.online" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800">
                      info@assistbridge.online →
                    </a>
                  </div>
                </Card>
                <Card className="p-5 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-slate-900">Live chat</p>
                    <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                      Available 9am–6pm UTC, Monday to Friday.
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-amber-700">
                      Click the chat bubble →
                    </span>
                  </div>
                </Card>
                <Card className="p-5 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-slate-900">Response time</p>
                    <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                      Under 24 hours, weekdays. Weekend messages answered Monday.
                    </p>
                  </div>
                </Card>
                <Card className="p-5 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-slate-900">Search the docs</p>
                    <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                      Looking for something specific? Browse our blog and guides.
                    </p>
                    <Link href="/blog" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-violet-700 hover:text-violet-800">
                      Read the blog →
                    </Link>
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
