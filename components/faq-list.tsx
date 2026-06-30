"use client";

import { useState } from "react";
import { Plus, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FaqListProps {
  faqs: Faq[];
  variant?: "grouped" | "flat";
}

export function FaqList({ faqs, variant = "grouped" }: FaqListProps) {
  const [open, setOpen] = useState<string | null>(
    faqs[0] ? (variant === "flat" ? "0" : `${faqs[0].category ?? "General"}-0`) : null
  );

  if (faqs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <HelpCircle className="h-12 w-12 mx-auto text-slate-300" />
        <h3 className="mt-4 font-bold tracking-tight text-slate-900">No FAQs yet</h3>
        <p className="mt-1 text-sm text-slate-600">Add FAQs from the admin panel to display them here.</p>
      </Card>
    );
  }

  if (variant === "flat") {
    return (
      <div className="max-w-3xl mx-auto divide-y divide-slate-200 border-y border-slate-200">
        {faqs.map((f, i) => {
          const key = `${i}`;
          const isOpen = open === key;
          return (
            <div key={f.id ?? key} className="group">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : key)}
                className="w-full flex items-center justify-between gap-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base md:text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {f.question}
                </span>
                <span className={`h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center shrink-0 transition-all ${isOpen ? "bg-emerald-600 border-emerald-600 text-white rotate-45" : "bg-white text-slate-500 group-hover:border-emerald-300 group-hover:text-emerald-600"}`}>
                  <Plus className="h-4 w-4" />
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed pr-12 max-w-2xl">
                    {f.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const grouped: Array<[string, Faq[]]> = [];
  const map = new Map<string, Faq[]>();
  for (const f of faqs) {
    const cat = f.category ?? "General";
    const arr = map.get(cat) ?? [];
    arr.push(f);
    map.set(cat, arr);
  }
  grouped.push(...Array.from(map.entries()));

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {grouped.map(([cat, qs]) => (
        <div key={cat}>
          <h2 className="text-lg font-bold text-slate-900 mb-4">{cat}</h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {qs.map((f, i) => {
              const key = `${cat}-${i}`;
              const isOpen = open === key;
              return (
                <div key={f.id ?? key} className="group">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : key)}
                    className="w-full flex items-center justify-between gap-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base md:text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {f.question}
                    </span>
                    <span className={`h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center shrink-0 transition-all ${isOpen ? "bg-emerald-600 border-emerald-600 text-white rotate-45" : "bg-white text-slate-500 group-hover:border-emerald-300 group-hover:text-emerald-600"}`}>
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed pr-12 max-w-2xl">
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
