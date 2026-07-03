"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface DashboardShellProps {
  nav?: NavItem[];
  groups?: NavGroup[];
  homeLabel?: string;
  homeHref?: string;
  pathLabels?: Record<string, string>;
  user: { name: string; email: string; role: string; avatar?: string };
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "admin" | "client";
}

export function DashboardShell({
  nav,
  groups,
  homeLabel = "Home",
  homeHref = "/",
  pathLabels,
  user,
  title,
  subtitle,
  children,
  variant = "client",
}: DashboardShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const palette = {
    admin: {
      aside: "bg-gray-950 text-gray-300",
      sectionLabel: "text-gray-500",
      itemBase: "text-gray-400 hover:bg-gray-900 hover:text-gray-200",
      itemActive: "bg-gray-900 text-white border-l-2 border-white pl-[calc(0.75rem-2px)]",
      iconMuted: "text-gray-500",
      activeIcon: "text-white",
      userBlock: "border-gray-800 bg-gray-950",
      signOut: "text-gray-400 hover:bg-gray-900 hover:text-gray-200",
    },
    client: {
      aside: "bg-white text-gray-800 border-gray-200",
      sectionLabel: "text-gray-400",
      itemBase: "text-gray-600 hover:bg-gray-100",
      itemActive:
        "bg-primary-50 text-primary-800 border-l-2 border-primary-600 pl-[calc(0.75rem-2px)] font-semibold",
      iconMuted: "text-gray-400",
      activeIcon: "text-primary-700",
      userBlock: "border-gray-200 bg-white",
      signOut: "text-gray-600 hover:bg-gray-100",
    },
  }[variant];

  const allCrumbs: BreadcrumbItem[] = [{ label: homeLabel, href: homeHref }];
  const segs = pathname.split("/").filter(Boolean);
  let acc = "";
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    acc += "/" + seg;
    const last = i === segs.length - 1;
    let label: string;
    if (pathLabels && pathLabels[seg]) {
      label = pathLabels[seg];
    } else if (last && /^[a-z0-9]{10,}$/i.test(seg)) {
      label = "#" + seg.slice(-6);
    } else {
      label = seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
    allCrumbs.push(last ? { label } : { label, href: acc });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Logo width={120} className="hidden sm:block" />
              <Logo variant="icon" width={28} className="sm:hidden" />
            </Link>
            <div className="hidden md:block h-5 w-px bg-gray-200 mx-1" />
            <nav
              aria-label="Breadcrumb"
              className="hidden md:flex items-center gap-1.5 text-sm min-w-0"
            >
              {allCrumbs.map((c, i) => {
                const last = i === allCrumbs.length - 1;
                return (
                  <span key={i} className="flex items-center gap-1.5 min-w-0">
                    {c.href && !last ? (
                      <Link
                        href={c.href}
                        className="text-gray-400 hover:text-gray-900 truncate"
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium truncate">
                        {c.label}
                      </span>
                    )}
                    {!last && (
                      <span className="text-gray-300 select-none">/</span>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-xs font-semibold flex items-center justify-center">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="hidden lg:block text-sm leading-tight">
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed lg:sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-60 transition-transform lg:translate-x-0 flex flex-col",
            palette.aside,
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex-1 min-h-0 px-2 py-3 overflow-y-auto">
            {(groups ?? (nav ? [{ items: nav }] : [])).map((group, gi) => (
              <div key={gi} className="mb-4">
                {group.label && (
                  <div
                    className={cn(
                      "px-3 pt-1 pb-1.5 text-xs font-medium tracking-wide",
                      palette.sectionLabel
                    )}
                  >
                    {group.label}
                  </div>
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href + "/")) ||
                      pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition",
                            active ? palette.itemActive : palette.itemBase
                          )}
                        >
                          <span
                            className={cn(
                              "shrink-0 [&>svg]:h-4 [&>svg]:w-4",
                              active ? palette.activeIcon : palette.iconMuted
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className={cn("shrink-0 p-3 border-t", palette.userBlock)}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate text-gray-200">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition",
                palette.signOut
              )}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {open && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-gray-900/50 top-14"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}