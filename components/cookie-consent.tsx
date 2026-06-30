"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ab_cookie_consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  function respond(choice: "all" | "essential") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">We use cookies</h3>
            <p className="mt-1 text-sm text-slate-600">
              We use essential cookies to make this site work. With your consent, we also use analytics cookies to understand how you use AssistBridge. See our{" "}
              <a href="/cookies" className="text-primary-700 underline">Cookie Policy</a>.
            </p>
          </div>
          <button
            onClick={() => respond("essential")}
            aria-label="Dismiss"
            className="shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => respond("all")} size="sm">Accept all</Button>
          <Button onClick={() => respond("essential")} variant="outline" size="sm">Essential only</Button>
        </div>
      </div>
    </div>
  );
}
