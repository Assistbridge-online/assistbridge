import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink, CheckCircle2, Star } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Portfolio | AssistBridge",
  description:
    "Browse real projects completed by our vetted experts — academic writing, web development, data analysis, and more.",
};

const projects = [
  {
    category: "Academic Writing",
    title: "PhD Thesis — Machine Learning in Healthcare",
    description:
      "A 180-page doctoral thesis on predictive ML models for early diagnosis of cardiovascular disease. Included literature review, methodology, statistical analysis with SPSS, and full APA formatting.",
    tags: ["Machine Learning", "SPSS", "APA 7th", "180 pages"],
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    alt: "Open books and a laptop displaying research notes",
  },
  {
    category: "Web Development",
    title: "E-Commerce Dashboard for a Retail Startup",
    description:
      "Built a full-stack admin dashboard with real-time inventory tracking, sales analytics, customer management, and Stripe payment integration. React + Node.js + PostgreSQL.",
    tags: ["React", "Node.js", "Stripe", "PostgreSQL"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    alt: "Laptop displaying analytics charts and data visualizations",
  },
  {
    category: "Data Analysis",
    title: "Statistical Analysis for Clinical Trial Data",
    description:
      "Analyzed patient response data from a Phase II clinical trial using SPSS and R. Delivered a comprehensive report with descriptive statistics, ANOVA, regression modelling, and publication-ready tables.",
    tags: ["SPSS", "R", "Clinical Research", "ANOVA"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    alt: "Data charts and graphs on a computer monitor",
  },
  {
    category: "Transcription",
    title: "Medical Conference Transcription (72 Hours)",
    description:
      "Transcribed 24 hours of recorded conference proceedings across 12 medical specialities. Delivered in 72 hours with speaker identification, time stamps, and medical terminology accuracy.",
    tags: ["Medical", "Time-stamped", "72hr turnaround"],
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    alt: "Headphones and a digital recorder on a desk",
  },
  {
    category: "Mobile App Development",
    title: "Fitness Tracking Mobile App",
    description:
      "Designed and developed a cross-platform fitness app with workout logging, progress charts, meal planning, and push notifications. React Native + Firebase.",
    tags: ["React Native", "Firebase", "iOS", "Android"],
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    alt: "Smartphone displaying a fitness tracking app interface",
  },
  {
    category: "Academic Writing",
    title: "MBA Dissertation — Supply Chain Optimisation",
    description:
      "A 15,000-word MBA dissertation analysing lean supply chain practices in East African manufacturing firms. Included a systematic literature review, survey design, and structural equation modelling.",
    tags: ["MBA", "Supply Chain", "SEM", "15,000 words"],
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    alt: "Notebook with handwritten notes and a pen",
  },
  {
    category: "Web Development",
    title: "Real Estate Listing Platform",
    description:
      "A property listing platform with advanced search filters, interactive map integration, virtual tour embedding, and an agent dashboard for listing management. Next.js + Tailwind + Supabase.",
    tags: ["Next.js", "Tailwind", "Supabase", "Maps API"],
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    alt: "Modern house exterior with clean architectural design",
  },
  {
    category: "Programming",
    title: "MATLAB Simulation — Autonomous Drone Navigation",
    description:
      "Developed a MATLAB simulation for obstacle avoidance and path planning in autonomous drones using a modified A* algorithm. Included visualisation dashboards and performance benchmarks.",
    tags: ["MATLAB", "Path Planning", "Simulation", "A* Algorithm"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    alt: "Drone in flight against a clear blue sky",
  },
  {
    category: "Transcription",
    title: "Legal Deposition Transcription (Certified)",
    description:
      "Provided certified verbatim transcription of 40+ hours of legal depositions. Included certificate of accuracy, speaker labels, and time-indexed exhibits.",
    tags: ["Legal", "Certified", "40+ hours"],
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    alt: "Legal documents and a gavel on a desk",
  },
];

const categories = [...new Set(projects.map((p) => p.category))];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-emerald-50/20 to-white" />
        <div className="container-x pt-20 pb-12 md:pt-28 md:pb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Our work</p>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] max-w-3xl mx-auto">
            Projects we&apos;ve delivered for clients worldwide
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Every project is handled by a vetted expert who understands your field.
            Here is a sample of what we have delivered across academic, technical, and digital services.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="container-x py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "1,200+", label: "Projects completed" },
              { value: "250+", label: "Vetted experts" },
              { value: "60+", label: "Countries served" },
              { value: "98%", label: "Client satisfaction" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{s.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter bar */}
      <div className="sticky top-16 z-20 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container-x py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`}
              className="shrink-0 px-4 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-900 hover:text-white transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Project grid by category */}
      {categories.map((cat) => {
        const slug = cat.toLowerCase().replace(/\s+/g, "-");
        const catProjects = projects.filter((p) => p.category === cat);
        return (
          <section key={cat} id={slug} className="scroll-mt-24 border-b border-slate-100">
            <div className="container-x py-12 md:py-16">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{cat}</h2>
              <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catProjects.map((p) => (
                  <article
                    key={p.title}
                    className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">{p.category}</div>
                      <h3 className="mt-1.5 text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {p.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section>
        <div className="container-x py-16">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white text-center">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="relative max-w-xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.1] tracking-tight">
                Ready to start your project?
              </h2>
              <p className="mt-4 text-base text-slate-300 leading-relaxed">
                Tell us what you need and get matched with a vetted expert in your field.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/calculator"
                  className="group inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-slate-900 text-[15px] font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Get a Free Quote <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <LinkButton href="/contact" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Contact us
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
