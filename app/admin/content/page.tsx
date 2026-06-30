import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { FileText, MessageCircle, Award, BookOpen, FileQuestion, ArrowRight, Settings, Tag, Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Content" };

export default async function ContentPage() {
  const [servicesCount, testimonialsCount, teamCount, faqCount, postsCount, disciplinesCount, statsCount] = await Promise.all([
    prisma.service.count(),
    prisma.testimonial.count(),
    prisma.teamMember.count(),
    prisma.faq.count(),
    prisma.blogPost.count(),
    prisma.discipline.count(),
    prisma.siteStat.count(),
  ]);

  const cards = [
    { href: "/admin/disciplines", icon: <FileText className="h-6 w-6 text-primary-700" />, title: "Disciplines", count: disciplinesCount, desc: "Areas of expertise shown across the site" },
    { href: "/admin/services", icon: <Tag className="h-6 w-6 text-accent-600" />, title: "Services", count: servicesCount, desc: "Service catalog with per-page pricing" },
    { href: "/admin/pricing", icon: <Tag className="h-6 w-6 text-amber-600" />, title: "Pricing tiers", count: 0, desc: "Manage Starter, Professional, Enterprise" },
    { href: "/admin/testimonials", icon: <MessageCircle className="h-6 w-6 text-emerald-600" />, title: "Testimonials", count: testimonialsCount, desc: "Client quotes on home page" },
    { href: "/admin/team", icon: <Users className="h-6 w-6 text-primary-700" />, title: "Team", count: teamCount, desc: "Team members on about page" },
    { href: "/admin/blog", icon: <BookOpen className="h-6 w-6 text-accent-600" />, title: "Blog", count: postsCount, desc: "Articles on blog index" },
    { href: "/admin/faq", icon: <FileQuestion className="h-6 w-6 text-amber-600" />, title: "FAQ", count: faqCount, desc: "Frequently asked questions" },
    { href: "/admin/stats", icon: <Award className="h-6 w-6 text-emerald-600" />, title: "Site stats", count: statsCount, desc: "Numbers shown on home and about" },
  ];

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Content</h1>
      <p className="mt-1 text-slate-600">Manage all the content displayed across the marketing site.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card hover className="p-6 h-full">
              <div className="flex items-center justify-between">
                {c.icon}
                <span className="text-2xl font-bold text-slate-900">{c.count}</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
