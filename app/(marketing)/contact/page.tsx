"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Clock, Send, CheckCircle2, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const channels = [
  {
    i: <Mail className="h-5 w-5" />,
    bg: "bg-emerald-100 text-emerald-700",
    t: "Email",
    v: "info@assistbridge.online",
    d: "We reply within 1 business day.",
  },
  {
    i: <MessageCircle className="h-5 w-5" />,
    bg: "bg-amber-100 text-amber-700",
    t: "Live chat",
    v: "Available 9am–6pm UTC",
    d: "Click the chat bubble at the bottom-right of any page.",
  },
  {
    i: <Clock className="h-5 w-5" />,
    bg: "bg-sky-100 text-sky-700",
    t: "Response time",
    v: "Under 24 hours",
    d: "Monday–Friday, 9am–6pm UTC. Weekend messages answered Monday.",
  },
  {
    i: <Globe className="h-5 w-5" />,
    bg: "bg-violet-100 text-violet-700",
    t: "Operations",
    v: "Worldwide",
    d: "We serve clients in 60+ countries. Our team is fully remote.",
  },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Message sent. We'll get back to you within one business day.");
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="container-x py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Send a message</p>
            <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Let&apos;s talk.
            </h1>
            <p className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">
              Questions, custom quotes, partnerships, or just feedback. The more context
              you give, the faster we can help. We respond within one business day.
            </p>

            <Card className="mt-6 p-6 md:p-8">
              {sent ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600" />
                  <h3 className="mt-3 font-bold tracking-tight text-emerald-900">Message sent</h3>
                  <p className="mt-1 text-sm text-emerald-700">We&apos;ll get back to you within one business day.</p>
                  <Button onClick={() => setSent(false)} variant="outline" className="mt-4">Send another message</Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Your name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Smith"
                        className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Subject</label>
                    <input
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="What is this about?"
                      className="mt-1 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you need help with..."
                      className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                    Send message <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </Card>
          </div>

          <aside className="lg:col-span-5 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Other channels</p>
              <h2 className="mt-3 text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Reach us your way.
              </h2>
            </div>
            {channels.map((c) => (
              <Card key={c.t} className="p-5 flex items-start gap-3 hover:shadow-md transition-shadow">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
                  {c.i}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-slate-900">{c.t}</p>
                  <p className="text-sm text-slate-700 mt-0.5">{c.v}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.d}</p>
                </div>
              </Card>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
