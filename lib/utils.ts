import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: string = "en-US") {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, max: number = 120) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export const DISCIPLINES = [
  "Science & Engineering",
  "Medicine & Health",
  "Business & Finance",
  "Technology & Computing",
  "Humanities & Social Sciences",
  "Law & Policy",
  "Arts & Design",
  "Education & Academia",
  "Mathematics & Statistics",
  "Environment & Agriculture",
  "Communications & Media",
  "Architecture & Construction",
  "Biotechnology & Biomedical Engineering",
  "Data Science & Artificial Intelligence",
  "Cybersecurity & Information Assurance",
  "Aerospace & Aviation",
  "Neuroscience & Cognitive Science",
  "Pharmaceutical Sciences",
  "Sports & Exercise Science",
  "Energy & Sustainable Development",
  "Materials Science & Nanotechnology",
  "Robotics & Automation",
] as const;

export const SERVICE_CATEGORIES = [
  "Research Assistance",
  "Academic Writing",
  "Data Analysis",
  "Technical / IT Help",
  "Software Development",
  "Statistical Consulting",
  "Editing & Proofreading",
  "Translation",
  "Business Plans & Reports",
  "Engineering Design",
  "Tutoring & Coaching",
  "Custom Project",
] as const;

export const PLATFORM_FEE_PERCENT = 15;
