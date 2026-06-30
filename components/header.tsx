"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-slate-200/70 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)]"
          : "bg-gradient-to-b from-white via-white to-primary-50/40 backdrop-blur-md border-transparent"
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="AssistBridge home" className="shrink-0 flex items-center">
          <Logo width={240} className="hidden sm:block" />
          <Logo variant="icon" width={44} className="sm:hidden" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {siteConfig.nav.main.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-[15px] font-medium tracking-tight rounded-md transition-colors duration-200",
                  "text-slate-700 hover:text-primary-800",
                  "after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-primary-600 after:scale-x-0 after:origin-left after:transition-transform after:duration-300",
                  "hover:after:scale-x-100",
                  active && "text-primary-800 after:scale-x-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 active:bg-emerald-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <span>Sign in</span>
          </Link>
        </div>

        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 shrink-0"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="w-full px-4 sm:px-6 py-3 flex flex-col gap-1">
            {siteConfig.nav.main.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium rounded-md",
                    active ? "bg-primary-50 text-primary-800" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-slate-200 my-2" />
            <Link href="/login" className="px-3 py-2.5 text-sm font-medium text-slate-700">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
