import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  DashboardShell,
  type NavGroup,
} from "@/components/dashboard-shell";
import {
  LayoutDashboard,
  Users,
  Award,
  FileText,
  CreditCard,
  AlertCircle,
  Settings,
  Database,
  FileQuestion,
  MessageSquare,
  BookOpen,
  Tag,
  TrendingUp,
  Wrench,
  Inbox,
} from "lucide-react";

const iconCls = "h-4 w-4";

// 17 admin modules grouped into WP-style sections. Order matters — admins
// build muscle memory: Console -> People -> Marketplace -> Finance ->
// Content -> Configuration.
const groups: NavGroup[] = [
  {
    label: "Console",
    items: [
      { label: "Overview", href: "/admin", icon: <LayoutDashboard className={iconCls} /> },
      { label: "Support inbox", href: "/admin/support", icon: <Inbox className={iconCls} /> },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: <Users className={iconCls} /> },
      { label: "Experts", href: "/admin/experts", icon: <Award className={iconCls} /> },
      { label: "Team", href: "/admin/team", icon: <Users className={iconCls} /> },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { label: "Orders", href: "/admin/orders", icon: <FileText className={iconCls} /> },
      { label: "Disputes", href: "/admin/disputes", icon: <AlertCircle className={iconCls} /> },
      { label: "Disciplines", href: "/admin/disciplines", icon: <Wrench className={iconCls} /> },
      { label: "Services", href: "/admin/services", icon: <Database className={iconCls} /> },
      { label: "Pricing", href: "/admin/pricing", icon: <Tag className={iconCls} /> },
      { label: "Testimonials", href: "/admin/testimonials", icon: <MessageSquare className={iconCls} /> },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Payments", href: "/admin/payments", icon: <CreditCard className={iconCls} /> },
      { label: "Site stats", href: "/admin/stats", icon: <TrendingUp className={iconCls} /> },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: <BookOpen className={iconCls} /> },
      { label: "FAQ", href: "/admin/faq", icon: <FileQuestion className={iconCls} /> },
      { label: "Site content", href: "/admin/content", icon: <FileQuestion className={iconCls} /> },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Settings", href: "/admin/settings", icon: <Settings className={iconCls} /> },
    ],
  },
];

// Map URL segments -> human-friendly labels for the breadcrumb. Anything
// not in this map is humanized (kebab-case -> Title Case).
const pathLabels: Record<string, string> = {
  admin: "Admin Console",
  users: "Users",
  experts: "Experts",
  team: "Team",
  orders: "Orders",
  disputes: "Disputes",
  disciplines: "Disciplines",
  services: "Services",
  pricing: "Pricing",
  testimonials: "Testimonials",
  payments: "Payments",
  stats: "Site stats",
  blog: "Blog",
  faq: "FAQ",
  content: "Site content",
  settings: "Settings",
  support: "Support inbox",
  new: "New",
  edit: "Edit",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");

  const user = {
    name: session.user.name || "Admin",
    email: session.user.email || "",
    role: "Administrator",
  };

  return (
    <DashboardShell
      variant="admin"
      groups={groups}
      homeLabel="Admin Console"
      homeHref="/admin"
      pathLabels={pathLabels}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}