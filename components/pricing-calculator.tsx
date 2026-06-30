"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Calculator, Sparkles, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface PricingCalculatorProps {
  serviceId: string;
  serviceName: string;
  pricePerPage: number;
  minPages: number;
  maxPages?: number;
  pageUnit: string;
  wordsPerPage: number;
  turnaroundDays: number;
  rushMultiplier: number;
}

function todayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function minDeadlineISO(turnaroundDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.max(1, Math.ceil(turnaroundDays / 2)));
  return d.toISOString().split("T")[0];
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export function PricingCalculator({
  serviceId,
  serviceName,
  pricePerPage,
  minPages,
  maxPages,
  pageUnit,
  wordsPerPage,
  turnaroundDays,
  rushMultiplier,
}: PricingCalculatorProps) {
  const [pages, setPages] = useState(minPages);
  const [deadlineDate, setDeadlineDate] = useState(minDeadlineISO(turnaroundDays));
  const [deadlineTime, setDeadlineTime] = useState("17:00");

  const deadlineInfo = useMemo(() => {
    if (!deadlineDate) return { type: "standard" as const, multiplier: 1.0, daysAway: null, deadlineAt: null };
    const [h, m] = (deadlineTime || "17:00").split(":").map((n) => parseInt(n, 10));
    const dl = new Date(deadlineDate);
    dl.setHours(h || 17, m || 0, 0, 0);
    const days = daysBetween(new Date(), dl);
    const isUrgent = days < turnaroundDays;
    return {
      type: isUrgent ? ("urgent" as const) : ("standard" as const),
      multiplier: isUrgent ? rushMultiplier : 1.0,
      daysAway: Math.round(days * 10) / 10,
      deadlineAt: dl,
    };
  }, [deadlineDate, deadlineTime, turnaroundDays, rushMultiplier]);

  const subtotal = useMemo(() => pages * pricePerPage, [pages, pricePerPage]);
  const adjustedPricePerUnit = useMemo(
    () => pricePerPage * deadlineInfo.multiplier,
    [pricePerPage, deadlineInfo.multiplier]
  );
  const total = subtotal * deadlineInfo.multiplier;

  const unitLabel =
    pageUnit === "page"
      ? "pages"
      : pageUnit === "slide"
        ? "slides"
        : pageUnit === "sheet"
          ? "sheets"
          : pageUnit === "hour"
            ? "hours"
            : pageUnit + "s";
  const wordCount = pages * wordsPerPage;

  return (
    <Card className="p-6 sticky top-20">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary-700" />
        <h3 className="text-lg font-bold tracking-tight text-slate-900">Price calculator</h3>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Number of {unitLabel}
            </label>
            <span className="text-sm font-bold text-slate-900">{pages}</span>
          </div>
          <input
            type="range"
            min={minPages}
            max={maxPages ?? Math.max(minPages + 100, 100)}
            value={pages}
            onChange={(e) => setPages(Math.max(minPages, parseInt(e.target.value, 10) || minPages))}
            className="mt-2 w-full accent-primary-700"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Min {minPages}</span>
            {maxPages && <span>Max {maxPages}</span>}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setPages((p) => Math.max(minPages, p - 1))}
              className="h-8 w-8 rounded-md border border-slate-300 hover:bg-slate-50"
              aria-label="Decrease"
            >−</button>
            <input
              type="number"
              min={minPages}
              max={maxPages}
              value={pages}
              onChange={(e) => setPages(Math.max(minPages, parseInt(e.target.value, 10) || minPages))}
              className="flex-1 h-8 text-center rounded-md border border-slate-300 text-sm"
            />
            <button
              onClick={() => setPages((p) => p + 1)}
              className="h-8 w-8 rounded-md border border-slate-300 hover:bg-slate-50"
              aria-label="Increase"
            >+</button>
          </div>
          {pageUnit === "page" && (
            <p className="mt-2 text-xs text-slate-500">
              ≈ {wordCount.toLocaleString()} words ({wordsPerPage} words per page)
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-900">Deadline date &amp; time</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="date"
                value={deadlineDate}
                min={todayISO()}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative">
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
          <span className="text-sm font-semibold text-slate-900">Total</span>
          <span className="text-xl font-bold text-slate-900">{formatCurrency(total)}</span>
        </div>

        <Button
          asChild
          className="w-full"
          size="sm"
        >
          <Link
            href={`/dashboard/new?service=${serviceId}&pages=${pages}&deadline=${encodeURIComponent(deadlineDate)}&time=${encodeURIComponent(deadlineTime)}`}
          >
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5" /> Request
            </span>
          </Link>
        </Button>
      </div>
    </Card>
  );
}
