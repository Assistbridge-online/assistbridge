"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface CategoryDropdownProps {
  categories: { name: string; count: number }[];
  active: string;
}

export function CategoryDropdown({ categories, active }: CategoryDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (v === "All") {
      params.delete("category");
    } else {
      params.set("category", v);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(`${pathname}${qs ? "?" + qs : ""}`);
  }

  return (
    <div className="relative">
      <select
        defaultValue={active}
        onChange={onChange}
        className="appearance-none w-full h-10 pl-3 pr-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 cursor-pointer"
      >
        <option value="All">All categories</option>
        {categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name} ({c.count})
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
    </div>
  );
}
