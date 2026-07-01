"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Upload, DollarSign, Users, Calendar, Award, Star, Clock, Shield, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DISCIPLINES } from "@/lib/utils";

const perks = [
  "Set your own rates",
  "Get matched with serious clients",
  "Secure payment processing",
  "Flexible schedule",
  "Paid weekly",
  "Long-term client relationships",
];

const requirements = [
  "Bachelor's degree or higher (or equivalent professional experience)",
  "3+ years of professional experience in your field",
  "Strong written English communication",
  "Ability to deliver on agreed deadlines",
  "A reliable computer and internet connection",
];

const process = [
  { n: "1", t: "Submit your application", d: "Tell us about your expertise, experience, and sample work." },
  { n: "2", t: "We review your credentials", d: "Our team reviews your application within 5 business days." },
  { n: "3", t: "Complete a paid trial task", d: "A small trial task in your discipline to verify quality." },
  { n: "4", t: "Get listed and receive matches", d: "Start receiving client matches and earning immediately." },
];

const qualities = [
  {
    icon: <Award className="h-6 w-6" />,
    bg: "bg-emerald-100 text-emerald-700",
    t: "Domain depth",
    d: "Deep knowledge in your field, backed by credentials and real-world experience.",
  },
  {
    icon: <Star className="h-6 w-6" />,
    bg: "bg-amber-100 text-amber-700",
    t: "Quality focus",
    d: "You deliver work that meets academic and professional standards.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    bg: "bg-sky-100 text-sky-700",
    t: "Reliability",
    d: "You hit deadlines and communicate proactively when things shift.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    bg: "bg-violet-100 text-violet-700",
    t: "Integrity",
    d: "You produce original work and respect client confidentiality.",
  },
];

export function BecomeAnExpertPageClient() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    expertise: [] as string[],
    bio: "",
    sampleWorkUrl: "",
    cvFile: null as File | null,
  });

  function toggleExpertise(e: string) {
    setForm((f) => ({
      ...f,
      expertise: f.expertise.includes(e)
        ? f.expertise.filter((x) => x !== e)
        : [...f.expertise, e],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.bio || form.expertise.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/expert-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          expertise: form.expertise.join(", "),
          bio: form.bio,
          sampleWorkUrl: form.sampleWorkUrl,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Application received! We'll review and get back to you within 5 business days.");
      setForm({ name: "", email: "", phone: "", expertise: [], bio: "", sampleWorkUrl: "", cvFile: null });
    } catch {
      toast.error("Submission failed. Please try again or email us at info@assistbridge.online.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">For experts</p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-slate-900 leading-[1.1]">
              Earn on your expertise. Work on your terms.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Join 250+ vetted experts who earn meaningful income helping clients with research,
              technical, and academic work. We handle matching, payments, and disputes. You focus
              on the work.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#apply"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-emerald-600 text-white text-[15px] font-semibold hover:bg-emerald-700 transition-colors"
              >
                Apply to join <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#process"
                className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-slate-300 text-slate-700 text-[15px] font-semibold hover:bg-slate-50 transition-colors"
              >
                How it works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PERKS ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Perks</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Why experts love working with us.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                We have designed every part of the platform to make expert work
                sustainable, well-paid, and respectful of your time.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {perks.map((p) => (
                <div key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="process" className="bg-slate-50 border-y border-slate-200">
        <div className="container-x py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How it works</p>
            <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Four steps from application to first match.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Getting on the platform is straightforward. We review every application
              personally and provide feedback regardless of the outcome.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {process.map((p) => (
              <Card key={p.n} className="p-6 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-emerald-600 leading-none">{p.n}</div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{p.t}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.d}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">Requirements</h3>
              <ul className="mt-4 space-y-2.5">
                {requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-6 bg-emerald-50 border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-slate-900">A note from our team</p>
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                We review every application personally. If we do not think you are a fit for the
                platform right now, we will tell you and often suggest another opportunity that
                is a better match. Most of our best experts come back later.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ===================== WHAT MAKES A GREAT EXPERT ===================== */}
      <section>
        <div className="container-x py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Expertise</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                What makes a great expert.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                The best experts on our platform share a few things in common. They
                communicate clearly, deliver on time, and take pride in their work.
              </p>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              {qualities.map((f) => (
                <div
                  key={f.t}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${f.bg}`}>
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{f.t}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== APPLICATION FORM ===================== */}
      <section id="apply" className="bg-slate-50 border-y border-slate-200">
        <div className="container-x py-12 md:py-14">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Apply</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Apply to join the network.
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                We review every application personally. Most applications are reviewed within
                five business days.
              </p>

              <Card className="mt-5 p-5 md:p-6">
                <form onSubmit={submit} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Smith"
                        className="mt-1 w-full h-9 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="mt-1 w-full h-9 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1 w-full h-9 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">Portfolio link</label>
                      <input
                        type="url"
                        value={form.sampleWorkUrl}
                        onChange={(e) => setForm({ ...form, sampleWorkUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="mt-1 w-full h-9 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Areas of expertise <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                      {DISCIPLINES.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => toggleExpertise(d)}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                            form.expertise.includes(d)
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Short bio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Tell us about your background, specializations, and notable work..."
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700">CV / Resume (PDF, optional)</label>
                    <label className="mt-1 flex items-center justify-center gap-2 h-9 px-3 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors">
                      <Upload className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-600 truncate">
                        {form.cvFile ? form.cvFile.name : "Upload your resume"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => setForm({ ...form, cvFile: e.target.files?.[0] || null })}
                      />
                    </label>
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    loading={loading}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {loading ? "Submitting..." : "Submit application"} <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-[11px] text-slate-500 text-center">
                    By submitting, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-slate-700">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-slate-700">Privacy Policy</Link>.
                  </p>
                </form>
              </Card>
            </div>

            <aside className="lg:col-span-4 space-y-3">
              <Card className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Top-rated experts earn more</p>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    Experts with strong ratings receive priority matching and premium rates.
                  </p>
                </div>
              </Card>
              <Card className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Work on your schedule</p>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    Accept only the projects you want. No minimum hour commitments.
                  </p>
                </div>
              </Card>
              <Card className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Set your own rate</p>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    No bidding wars, no race to the bottom. You set the price.
                  </p>
                </div>
              </Card>
              <Card className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Global client base</p>
                  <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                    Work with clients from 60+ countries. Diverse projects.
                  </p>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section>
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Get started</p>
              <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                Ready to put your expertise to work?
              </h2>
              <p className="mt-4 text-base text-slate-300 max-w-2xl leading-relaxed">
                Apply now and start receiving client matches. We review applications within
                five business days and provide feedback either way.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#apply"
                  className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Apply now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="mailto:experts@assistbridge.online"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/20 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors"
                >
                  Ask a question
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
