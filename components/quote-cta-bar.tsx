"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export function QuoteCtaBar() {
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("quoteCtaDismissed") === "1") {
      setDismissed(true);
      return;
    }
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("quoteCtaDismissed", "1");
    }
  }

  if (dismissed || !show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-3 shadow-2xl">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Need a project done?</p>
          <p className="text-xs text-slate-300 leading-tight">Get a free quote in under 5 minutes.</p>
        </div>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors shrink-0"
        >
          Get Quote <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
