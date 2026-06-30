import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { LayoutDashboard, Briefcase, ListChecks, DollarSign, User, Settings } from "lucide-react";

const nav: NavItem[] = [
  { label: "Overview", href: "/expert", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Available jobs", href: "/expert/jobs", icon: <Briefcase className="h-4 w-4" /> },
  { label: "My jobs", href: "/expert/orders", icon: <ListChecks className="h-4 w-4" /> },
  { label: "Earnings", href: "/expert/earnings", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Profile", href: "/expert/profile", icon: <User className="h-4 w-4" /> },
  { label: "Settings", href: "/expert/settings", icon: <Settings className="h-4 w-4" /> },
];

export default async function ExpertLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/expert");
  const user = {
    name: session.user.name || "Expert",
    email: session.user.email || "",
    role: "Expert",
  };
  return (
    <DashboardShell nav={nav} user={user} accentColor="accent">
      {children}
    </DashboardShell>
  );
}
