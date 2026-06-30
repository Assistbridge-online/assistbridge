import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { LayoutDashboard, Users, Award, FileText, CreditCard, AlertCircle, Settings, Database, FileQuestion, MessageSquare, BookOpen, Tag, TrendingUp, Wrench } from "lucide-react";

const nav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Experts", href: "/admin/experts", icon: <Award className="h-4 w-4" /> },
  { label: "Orders", href: "/admin/orders", icon: <FileText className="h-4 w-4" /> },
  { label: "Payments", href: "/admin/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Disputes", href: "/admin/disputes", icon: <AlertCircle className="h-4 w-4" /> },
  { label: "Disciplines", href: "/admin/disciplines", icon: <Wrench className="h-4 w-4" /> },
  { label: "Services", href: "/admin/services", icon: <Database className="h-4 w-4" /> },
  { label: "Pricing", href: "/admin/pricing", icon: <Tag className="h-4 w-4" /> },
  { label: "Testimonials", href: "/admin/testimonials", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Team", href: "/admin/team", icon: <Users className="h-4 w-4" /> },
  { label: "Blog", href: "/admin/blog", icon: <BookOpen className="h-4 w-4" /> },
  { label: "FAQ", href: "/admin/faq", icon: <FileQuestion className="h-4 w-4" /> },
  { label: "Site stats", href: "/admin/stats", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Content", href: "/admin/content", icon: <FileQuestion className="h-4 w-4" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  const user = {
    name: session.user.name || "Admin",
    email: session.user.email || "",
    role: "Admin",
  };
  return (
    <DashboardShell nav={nav} user={user} accentColor="emerald">
      {children}
    </DashboardShell>
  );
}
