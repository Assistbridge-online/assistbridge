"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  HelpCircle,
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
  /** Optional uppercase section header shown above the items. */
  label?: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface DashboardShellProps {
  /** Flat nav list — rendered as one ungrouped block if `groups` is not provided. */
  nav?: NavItem[];
  /** Grouped nav (preferred for admin / power-user consoles). Wins over `nav`. */
  groups?: NavGroup[];
  /** Label for the root breadcrumb segment (e.g. "Admin Console"). Defaults to "Home". */
  homeLabel?: string;
  /** Href for the root breadcrumb segment. Defaults to "/". */
  homeHref?: string;
  /**
   * Map of URL segment -> friendly label for the breadcrumb. Segments not in
   * the map are humanized (kebab-case -> Title Case). The last segment is
   * always rendered without a link.
   */
  pathLabels?: Record<string, string>;
  user: { name: string; email: string; role: string; avatar?: string };
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /**
   * `admin` -> dark slate sidebar with emerald accents (default for /admin).
   * `client` -> light sidebar with primary-blue accents (default for /dashboard).
   * The accent only changes the active-item highlight color; the layout is
   * otherwise identical.
   */
  variant?: "admin" | "client";
}

/**
 * DashboardShell — layout primitive for both /admin and /dashboard consoles.
 *
 * Visual model (WP-6 admin inspired):
 *  - Dark slate-800 left sidebar (or light slate-50 for client variant),
 *    fixed/sticky at the top, full-height, scrollable independently.
 *  - Slim white top header with breadcrumb, search, notifications, avatar.
 *  - Slate-100 outer background; main content sits inside a white rounded
 *    panel with shadow so the page reads as one card ("the wrap").
 *  - Sidebar groups render with uppercase section labels (WP-6 style).
 *  - Active sidebar item gets a left accent stripe + tinted background.
 */
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

  // Sidebar palette per variant. Admin = dark slate sidebar with emerald
  // accents (matches WP-6 admin-#1F2937 with a brand accent). Client =
  // light sidebar with primary blue accent.
  const palette = {
    admin: {
      aside: "bg-slate-800 text-slate-100 border-slate-900",
      sectionLabel: "text-slate-400",
      itemBase: "text-slate-300 hover:bg-slate-700/60 hover:text-white",
      itemActive:
        "bg-slate-900 text-white border-l-2 border-emerald-400 pl-[calc(0.75rem-2px)]",
      iconMuted: "text-slate-400",
      activeIcon: "text-emerald-400",
      userBlock: "border-slate-700 bg-slate-800",
      signOut: "text-slate-300 hover:bg-slate-700 hover:text-white",
    },
    client: {
      aside: "bg-white text-slate-800 border-slate-200",
      sectionLabel: "text-slate-400",
      itemBase: "text-slate-700 hover:bg-slate-100",
      itemActive:
        "bg-primary-50 text-primary-800 border-l-2 border-primary-600 pl-[calc(0.75rem-2px)] font-semibold",
      iconMuted: "text-slate-400",
      activeIcon: "text-primary-700",
      userBlock: "border-slate-200 bg-white",
      signOut: "text-slate-700 hover:bg-slate-100",
    },
  }[variant];

  // Derive breadcrumb segments from the current pathname. The first segment
  // is replaced with `homeLabel` (so /admin -> "Admin Console"), subsequent
  // segments are looked up in `pathLabels` or humanized, and dynamic IDs
  // (long alphanumeric segments) are shown as "#abcdef" for readability.
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
    <div className="min-h-screen bg-slate-100">
      {/* ─── Top header (slim, sticky, with breadcrumb + actions) ─── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 text-slate-700"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Logo width={120} className="hidden sm:block" />
              <Logo variant="icon" width={28} className="sm:hidden" />
            </Link>
            <div className="hidden md:block h-6 w-px bg-slate-200 mx-1" />
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
                        className="text-slate-500 hover:text-slate-900 truncate"
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-slate-900 font-medium truncate">
                        {c.label}
                      </span>
                    )}
                    {!last && (
                      <span className="text-slate-300 select-none">/</span>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              aria-label="Search"
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              aria-label="Notifications"
              className="h-9 w-9 inline-flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button
              aria-label="Help"
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-2 pl-1">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-xs font-semibold flex items-center justify-center">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden lg:block text-sm leading-tight">
                <div className="font-medium text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ─── Sidebar ─── */}
        <aside
          className={cn(
            "fixed lg:sticky top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-60 border-r transition-transform lg:translate-x-0 flex flex-col",
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
                      "px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider",
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
                            "flex items-center gap-2.5 px-3 py-2 rounded-r-md text-[13px] font-medium transition",
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
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition",
                palette.signOut
              )}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {open && (
          <div
            className="lg:hidden fixed inset-0 z-20 bg-slate-900/50 top-14"
            onClick={() => setOpen(false)}
          />
        )}

        {/* ─── Main content area (the "WP wrap") ─── */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 lg:p-6">
            {(title || subtitle) && (
              <div className="mb-6 pb-5 border-b border-slate-200">
                {title && (
                  <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}