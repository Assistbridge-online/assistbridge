import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  DashboardShell,
  type NavItem,
} from "@/components/dashboard-shell";
import {
  LayoutDashboard,
  FileText,
  Plus,
  MessageSquare,
  CreditCard,
  Settings,
} from "lucide-react";

const nav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "My Orders", href: "/dashboard/orders", icon: <FileText className="h-4 w-4" /> },
  { label: "New Request", href: "/dashboard/new", icon: <Plus className="h-4 w-4" /> },
  { label: "Messages", href: "/dashboard/messages", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Payments", href: "/dashboard/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="h-4 w-4" /> },
];

const pathLabels: Record<string, string> = {
  dashboard: "My Portal",
  orders: "Orders",
  new: "New Request",
  messages: "Messages",
  payments: "Payments",
  settings: "Settings",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    console.log("[dashboard/layout] no session, redirecting to /login", {
      hasSession: !!session,
    });
    redirect("/login?callbackUrl=/dashboard");
  }
  const user = {
    name: session.user.name || "User",
    email: session.user.email || "",
    role: "Client",
  };
  return (
    <DashboardShell
      variant="client"
      nav={nav}
      homeLabel="My Portal"
      homeHref="/dashboard"
      pathLabels={pathLabels}
      user={user}
    >
      {children}
    </DashboardShell>
  );
}