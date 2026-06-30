"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, Bell, ChevronDown } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function DashboardShell({
  nav,
  user,
  title,
  subtitle,
  children,
  accentColor = "primary",
}: {
  nav: NavItem[];
  user: { name: string; email: string; role: string; avatar?: string };
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  accentColor?: "primary" | "accent" | "emerald";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const colors = {
    primary: { bg: "bg-primary-700", hover: "hover:bg-primary-50", active: "bg-primary-50 text-primary-800", text: "text-primary-800" },
    accent: { bg: "bg-accent-600", hover: "hover:bg-accent-50", active: "bg-accent-50 text-accent-700", text: "text-accent-700" },
    emerald: { bg: "bg-emerald-700", hover: "hover:bg-emerald-50", active: "bg-emerald-50 text-emerald-800", text: "text-emerald-800" },
  }[accentColor];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/"><Logo width={140} className="hidden sm:block" /></Link>
            <Link href="/"><Logo variant="icon" width={32} className="sm:hidden" /></Link>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-slate-100 relative">
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-xs font-semibold flex items-center justify-center">
                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-900 leading-tight">{user.name}</div>
                <div className="text-xs text-slate-500 leading-tight">{user.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 transition-transform lg:translate-x-0 overflow-y-auto",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-3 space-y-0.5">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                    active ? colors.active : `text-slate-700 ${colors.hover}`
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {open && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-slate-900/50 top-16"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 p-4 lg:p-8 max-w-full">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>}
              {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
