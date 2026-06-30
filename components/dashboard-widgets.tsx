"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function StatCard({
  label, value, change, icon, accent = "primary"
}: {
  label: string; value: string | number; change?: { value: string; up?: boolean };
  icon?: React.ReactNode; accent?: "primary" | "accent" | "emerald" | "amber";
}) {
  const colors = {
    primary: "bg-primary-50 text-primary-700",
    accent: "bg-accent-50 text-accent-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[accent];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
          {change && (
            <div className={cn("mt-1 text-xs font-medium", change.up ? "text-emerald-600" : "text-slate-500")}>
              {change.up ? "↑" : "↓"} {change.value}
            </div>
          )}
        </div>
        {icon && <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", colors)}>{icon}</div>}
      </div>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    QUOTED: "bg-amber-100 text-amber-800",
    PAID: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-cyan-100 text-cyan-800",
    REVISION_REQUESTED: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-slate-200 text-slate-600",
    DISPUTED: "bg-red-100 text-red-800",
    PENDING: "bg-amber-100 text-amber-800",
    VERIFIED: "bg-emerald-100 text-emerald-800",
    SUSPENDED: "bg-red-100 text-red-800",
    OPEN: "bg-red-100 text-red-800",
    UNDER_REVIEW: "bg-amber-100 text-amber-800",
    RESOLVED: "bg-emerald-100 text-emerald-800",
    SUCCEEDED: "bg-emerald-100 text-emerald-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-slate-200 text-slate-600",
    RELEASED: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold", map[status] || "bg-slate-100 text-slate-700")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <Card className="p-12 text-center">
      {icon && <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">{icon}</div>}
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="border-b border-slate-200 flex gap-1 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap",
            active === t.id ? "border-primary-700 text-primary-800" : "border-transparent text-slate-600 hover:text-slate-900"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {src ? <img src={src} alt={name} className="rounded-full w-full h-full object-cover" /> : name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  );
}
