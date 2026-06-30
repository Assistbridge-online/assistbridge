"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { ArrowRight, FileText, AlertCircle, Search, Building2, Clock, AlertTriangle, Paperclip, X, Upload, Link as LinkIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  SUBJECTS_BY_LEVEL,
  SUBJECT_MULTIPLIERS,
  LEVEL_MULTIPLIERS,
} from "@/lib/subjects";
import { searchAcademicSubjects, ACADEMIC_SUBJECTS } from "@/lib/academic-catalog";

declare global {
  interface Window {
    Dropbox?: {
      choose: (options: Record<string, unknown>) => void;
    };
    google?: {
      accounts: { oauth2: { initTokenClient: (opts: Record<string, unknown>) => { requestAccessToken: () => void } } };
      picker: typeof import("google.picker");
    };
    gapi?: {
      load: (libraries: string, callback: () => void) => void;
      client: { init: (opts: Record<string, unknown>) => Promise<void>; setToken: (token: string) => void };
    };
  }
}

// Urgency thresholds (in days). Below the threshold = urgent multiplier.
const URGENT_THRESHOLD_DAYS = 3;
const URGENT_MULTIPLIER = 1.5;

// Common timezones for the deadline selector. Includes a "detect from browser" option
// via the `detect` value (handled at runtime).
const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: "detect", label: "Detect from browser" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern (New York)" },
  { value: "America/Chicago", label: "Central (Chicago)" },
  { value: "America/Denver", label: "Mountain (Denver)" },
  { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Amsterdam", label: "Amsterdam" },
  { value: "Europe/Rome", label: "Rome" },
  { value: "Europe/Athens", label: "Athens" },
  { value: "Europe/Istanbul", label: "Istanbul" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "Africa/Johannesburg", label: "Johannesburg" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India (Kolkata)" },
  { value: "Asia/Bangkok", label: "Bangkok" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Seoul", label: "Seoul" },
  { value: "Australia/Perth", label: "Perth" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
];

export interface CalculatorService {
  id: string;
  slug: string;
  name: string;
  pricePerPage: number;
  minPages: number;
  maxPages: number | null;
  pageUnit: string;
  wordsPerPage: number;
}

export interface CalculatorLevel {
  id: string;
  slug: string;
  name: string;
}

interface CalculatorSubject {
  id: string;
  name: string;
  levelSlug: string;
  department: string | null;
  courseCode: string | null;
  description: string | null;
  priceMultiplier: number;
}

interface PriceCalculatorProps {
  services: CalculatorService[];
  levels: CalculatorLevel[];
  subjects?: CalculatorSubject[];
  defaultServiceSlug?: string;
  defaultLevelSlug?: string;
  action: (formData: FormData) => Promise<{ ok: boolean; redirect?: string; error?: string }>;
  requireAuth?: boolean;
  ctaLabel?: string;
  themed?: boolean;
}

export function PriceCalculator({
  services,
  levels,
  subjects,
  defaultServiceSlug,
  defaultLevelSlug,
  action,
  requireAuth,
  ctaLabel = "Save order and continue",
  themed = false,
}: PriceCalculatorProps) {
  const router = useRouter();
  const [serviceSlug, setServiceSlug] = useState(defaultServiceSlug ?? services[0]?.slug ?? "");
  const [levelSlug, setLevelSlug] = useState(defaultLevelSlug ?? levels[0]?.slug ?? "");
  const [subject, setSubject] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("17:00");
  const [timezone, setTimezone] = useState<string>(
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"
  );
  const [pages, setPages] = useState(5);
  const [brief, setBrief] = useState("");
  const [title, setTitle] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [fileSource, setFileSource] = useState<"upload" | "dropbox" | "gdrive" | "link">("upload");
  const [dropboxLink, setDropboxLink] = useState("");
  const [gdriveLink, setGdriveLink] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((s) => s.slug === serviceSlug);
  const level = levels.find((l) => l.slug === levelSlug);
  const allAvailableSubjects = (() => {
    if (!levelSlug) return [];
    // First, use subjects fetched from the database (database-driven)
    if (subjects && subjects.length > 0) {
      const dbSubjects = subjects.filter((s) => s.levelSlug === levelSlug);
      if (dbSubjects.length > 0) {
        return dbSubjects.map((s) => ({
          name: s.name,
          level: levelSlug as "high-school" | "college" | "undergraduate" | "masters" | "doctoral" | "research" | "professional",
          department: s.department ?? "General",
          courseCode: s.courseCode ?? "",
          description: s.description ?? "",
          institutions: s.institutions ? JSON.parse(s.institutions) : [],
          priceMultiplier: s.priceMultiplier,
        }));
      }
    }
    // Fallback to the static catalog
    const catalogSubjects = searchAcademicSubjects("", levelSlug);
    if (catalogSubjects.length > 0) return catalogSubjects;
    // Final fallback to the simple list
    return (SUBJECTS_BY_LEVEL[levelSlug] ?? []).map((name) => ({
      name,
      level: levelSlug as "high-school" | "college" | "undergraduate" | "masters" | "doctoral" | "research" | "professional",
      department: "General",
      courseCode: "",
      description: "",
      institutions: [],
      priceMultiplier: 1.0,
    }));
  })();
  const availableSubjects = subjectSearch
    ? searchAcademicSubjects(subjectSearch, levelSlug)
    : allAvailableSubjects;
  const subjectMultiplier = subject && levelSlug ? SUBJECT_MULTIPLIERS[levelSlug]?.[subject] ?? 1.0 : 1.0;
  const levelMultiplier = levelSlug ? LEVEL_MULTIPLIERS[levelSlug] ?? 1.0 : 1.0;

  // Calculate deadline and urgency from the chosen date + time
  const deadlineInfo = (() => {
    if (!deadlineDate) return { type: "standard" as const, multiplier: 1.0, daysAway: null, deadlineAt: null };
    const [hStr, mStr] = (deadlineTime || "17:00").split(":");
    const hours = parseInt(hStr || "17", 10);
    const minutes = parseInt(mStr || "0", 10);
    const dl = new Date(deadlineDate);
    dl.setHours(hours, minutes, 0, 0);
    const ms = dl.getTime() - Date.now();
    const daysAway = ms / (1000 * 60 * 60 * 24);
    const isUrgent = daysAway < URGENT_THRESHOLD_DAYS;
    return {
      type: (isUrgent ? "urgent" : "standard") as "urgent" | "standard",
      multiplier: isUrgent ? URGENT_MULTIPLIER : 1.0,
      daysAway: Math.round(daysAway * 10) / 10,
      deadlineAt: dl,
    };
  })();
  const deadlineMultiplier = deadlineInfo.multiplier;
  const selectedSubjectInfo = allAvailableSubjects.find((s) => s.name === subject) ?? null;

  const effectivePages = Math.max(pages || 0, 1);
  const basePrice = service?.pricePerPage ?? 0;
  const pricePerPage = basePrice * levelMultiplier * subjectMultiplier * deadlineMultiplier;
  const totalPrice = pricePerPage * effectivePages;

  const subjectValid = !levelSlug || subject !== "" || availableSubjects.length === 0;
  const pagesValid = effectivePages > 0;
  const canSubmit = !!service && !!level && subjectValid && pagesValid && title.trim() !== "" && brief.trim() !== "";

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("serviceSlug", serviceSlug);
      formData.set("levelSlug", levelSlug);
      formData.set("subject", subject);
      formData.set("deadlineType", deadlineInfo.type);
      formData.set("deadlineDate", deadlineDate);
      formData.set("deadlineTime", deadlineTime);
      formData.set("deadlineAt", deadlineInfo.deadlineAt ? deadlineInfo.deadlineAt.toISOString() : "");
      formData.set("deadlineTimezone", timezone === "detect" ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone);
      formData.set("pages", String(effectivePages));
      formData.set("quotedPrice", totalPrice.toFixed(2));
      formData.set("title", title);
      formData.set("brief", brief);
      formData.set("fileSource", fileSource);
      if (fileSource === "dropbox") formData.set("dropboxLink", dropboxLink);
      if (fileSource === "gdrive") formData.set("gdriveLink", gdriveLink);
      if (fileSource === "link") formData.set("externalLink", externalLink);
      if (cloudLinks.length > 0) formData.set("cloudLinks", JSON.stringify(cloudLinks));
      const result = await action(formData);
      if (result.ok && result.redirect) {
        router.push(result.redirect);
      } else if (!result.ok) {
        setError(result.error ?? "Something went wrong");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Filter services based on the selected subject (course)
  const filteredServices = (() => {
    if (!subject) return services;
    const subjectLower = subject.toLowerCase();
    const subjectWords = subjectLower.split(/[\s\/(),]+/).filter(Boolean);
    // Try to match by service category or by the first word of the subject
    const matched = services.filter((s) => {
      const category = s.name.toLowerCase();
      return subjectWords.some((w) => category.includes(w));
    });
    return matched.length > 0 ? matched : services;
  })();

  // If current service is not in the filtered list, switch to the first match
  if (subject && filteredServices.length > 0 && !filteredServices.find((s) => s.slug === serviceSlug)) {
    // Don't switch during render; show a hint instead
  }

  // External file integration: Dropbox Chooser + Google Drive Picker.
  // Both SDKs are loaded via Next.js Script. The actual API keys come from
  // NEXT_PUBLIC_DROPBOX_APP_KEY, NEXT_PUBLIC_GOOGLE_API_KEY, and
  // NEXT_PUBLIC_GOOGLE_CLIENT_ID. When the keys are not set, we fall back
  // to a paste-a-link field so the flow still works.
  const [cloudLinks, setCloudLinks] = useState<{ name: string; url: string; size?: number }[]>([]);

  function openDropboxChooser() {
    if (typeof window === "undefined" || !window.Dropbox) {
      alert("Dropbox Chooser is loading. If it does not open, add NEXT_PUBLIC_DROPBOX_APP_KEY to your env.");
      return;
    }
    window.Dropbox.choose({
      linkType: "direct",
      multiselect: true,
      extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".png", ".jpg", ".jpeg", ".txt"],
      success: (files: Array<{ name: string; link: string; bytes: number }>) => {
        setCloudLinks((prev) => [
          ...prev,
          ...files.map((f) => ({ name: f.name, url: f.link, size: f.bytes })),
        ]);
      },
      cancel: () => {},
    });
  }

  function openGoogleDrivePicker() {
    if (typeof window === "undefined") return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!apiKey || !clientId) {
      alert("Add NEXT_PUBLIC_GOOGLE_API_KEY and NEXT_PUBLIC_GOOGLE_CLIENT_ID to your env to enable Google Drive Picker.");
      return;
    }
    // Wait for the GIS and gapi clients to be ready (they load via Next/Script)
    const tryOpen = (attempt = 0) => {
      const w = window as unknown as Record<string, unknown>;
      const google = w["google"] as Record<string, unknown> | undefined;
      const accounts = google ? (google["accounts"] as Record<string, unknown> | undefined) : undefined;
      const oauth2 = accounts ? (accounts["oauth2"] as Record<string, unknown> | undefined) : undefined;
      const picker = google ? (google["picker"] as Record<string, unknown> | undefined) : undefined;
      const gapi = w["gapi"] as Record<string, unknown> | undefined;
      if (!oauth2 || !picker || !gapi) {
        if (attempt > 40) {
          alert("Google Drive Picker failed to load. Check your API key, Client ID, and network connection.");
          return;
        }
        return setTimeout(() => tryOpen(attempt + 1), 250);
      }
      const initTokenClient = (oauth2 as unknown as {
        initTokenClient: (opts: Record<string, unknown>) => {
          requestAccessToken: () => void;
          callback?: (r: { access_token?: string }) => void;
        };
      }).initTokenClient;
      const tokenClient = initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: () => {},
      });
      tokenClient.callback = async (tokenResponse: { access_token?: string; error?: string; error_description?: string }) => {
        if (tokenResponse.error) {
          if (tokenResponse.error === "invalid_client") {
            alert(
              "Google OAuth error 401: invalid_client.\n\n" +
              "This means the Google OAuth Client ID is not authorized for this domain.\n\n" +
              "Fix:\n" +
              "1. Go to console.cloud.google.com/apis/credentials\n" +
              "2. Open your OAuth 2.0 Client ID\n" +
              "3. Under 'Authorized JavaScript origins' add:\n" +
              "   - http://localhost:3000\n" +
              "   - https://your-production-domain.com\n" +
              "4. Save and wait a few minutes for changes to propagate."
            );
          } else {
            alert(`Google Drive error: ${tokenResponse.error}${tokenResponse.error_description ? " - " + tokenResponse.error_description : ""}`);
          }
          return;
        }
        if (!tokenResponse.access_token) return;
        const gapiClient = (gapi as unknown as { client: { setToken: (t: { access_token: string }) => void } }).client;
        gapiClient.setToken({ access_token: tokenResponse.access_token });
        const PickerBuilder = (picker as unknown as { PickerBuilder: new () => unknown }).PickerBuilder;
        const DocsView = (picker as unknown as { DocsView: new (id: string) => unknown }).DocsView;
        const ViewId = (picker as unknown as { ViewId: { DOCS: string } }).ViewId;
        const PickerBuilderType = PickerBuilder as unknown as new () => {
          addView: (v: unknown) => unknown;
          setOAuthToken: (t: string) => unknown;
          setDeveloperKey: (k: string) => unknown;
          setCallback: (cb: (data: { action: string; docs?: Array<{ name: string; url: string; sizeBytes?: number }> }) => void) => unknown;
          build: () => { setVisible: (v: boolean) => void };
        };
        const pickerBuilder = new (PickerBuilderType as unknown as new () => {
          addView: (v: unknown) => unknown;
          setOAuthToken: (t: string) => unknown;
          setDeveloperKey: (k: string) => unknown;
          setCallback: (cb: (data: { action: string; docs?: Array<{ name: string; url: string; sizeBytes?: number }> }) => void) => unknown;
          build: () => { setVisible: (v: boolean) => void };
        })();
        pickerBuilder
          .addView(new (DocsView as unknown as new (id: string) => unknown)(ViewId.DOCS))
          .setOAuthToken(tokenResponse.access_token)
          .setDeveloperKey(apiKey)
          .setCallback((data: { action: string; docs?: Array<{ name: string; url: string; sizeBytes?: number }> }) => {
            if (data.action === "picked" && data.docs) {
              setCloudLinks((prev) => [
                ...prev,
                ...data.docs.map((d: { name: string; url: string; sizeBytes?: number }) => ({ name: d.name, url: d.url, size: d.sizeBytes })),
              ]);
            }
          })
          .build()
          .setVisible(true);
      };
      tokenClient.requestAccessToken();
    };
    tryOpen();
  }

  return (
    <>
      <Script
        src="https://www.dropbox.com/static/api/2/dropins.js"
        strategy="lazyOnload"
        id="dropboxjs"
        data-app-key={process.env.NEXT_PUBLIC_DROPBOX_APP_KEY}
      />
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.gapi) {
            window.gapi.load("client|picker", () => {});
          }
        }}
      />
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        async
        defer
      />
    <Card className={
      themed
        ? "relative overflow-hidden p-6 md:p-8 border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 shadow-xl"
        : "p-6 md:p-8"
    }>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center overflow-hidden ring-1 ring-slate-200/60 shadow-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/44/44025.png"
            alt="Calculator"
            className="h-8 w-8 object-contain"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Price calculator</h2>
          <p className="text-sm text-slate-500">See the price before you commit</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Service</label>
          <select
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {filteredServices.map((s) => (
              <option key={s.id} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Academic level</label>
          <select
            value={levelSlug}
            onChange={(e) => {
              setLevelSlug(e.target.value);
              setSubject("");
            }}
            className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {levels.map((l) => (
              <option key={l.id} value={l.slug}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
          <div className="grid grid-cols-[1fr_200px] gap-2">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={allAvailableSubjects.length === 0}
              className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              {allAvailableSubjects.length === 0 ? (
                <option>No subjects available</option>
              ) : (
                <>
                  <option value="">Select a subject</option>
                  {allAvailableSubjects.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </>
              )}
            </select>
            <div className="relative">
              <input
                type="text"
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                placeholder="Search subjects..."
                className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {subjectSearch && availableSubjects.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {availableSubjects.slice(0, 8).map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => { setSubject(s.name); setSubjectSearch(""); }}
                      className="block w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-50"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
              {subjectSearch && availableSubjects.length === 0 && (
                <p className="mt-1 text-[10px] text-slate-500">No subjects match.</p>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Deadline date &amp; time
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={deadlineDate}
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
          {deadlineInfo.daysAway !== null && (
            <div className={`mt-1 flex items-center gap-1 text-[11px] ${
              deadlineInfo.type === "urgent" ? "text-amber-700" : "text-slate-500"
            }`}>
              {deadlineInfo.type === "urgent" ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <span>
                {deadlineInfo.type === "urgent"
                  ? `Urgent (+${Math.round((deadlineInfo.multiplier - 1) * 100)}%) — ${deadlineInfo.daysAway}d away`
                  : `Standard — ${deadlineInfo.daysAway}d away`}
              </span>
            </div>
          )}
        </div>
        <div className="md:col-span-2 grid grid-cols-[1fr_140px] gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Project title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Statistics homework chapter 3"
              className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {service?.pageUnit === "page" ? "Pages" : (service?.pageUnit ?? "Units")}
            </label>
            <input
              type="number"
              min={1}
              max={service?.maxPages ?? undefined}
              value={pages}
              onChange={(e) => setPages(parseInt(e.target.value) || 0)}
              className="w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Brief</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder="Describe what you need. Include any deadlines, reference materials, or specific requirements."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="mt-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Share reference files</p>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { key: "upload", label: "Upload", icon: Upload },
                { key: "dropbox", label: "Dropbox", icon: () => <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/dropbox.svg" alt="" className="h-3 w-3 invert" /> },
                { key: "gdrive", label: "Drive", icon: () => <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/googledrive.svg" alt="" className="h-3 w-3 invert" /> },
                { key: "link", label: "Link", icon: LinkIcon },
              ] as const).map((opt) => {
                const Icon = opt.icon;
                const active = fileSource === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFileSource(opt.key)}
                    className={`flex items-center justify-center gap-1 h-8 rounded-md text-[11px] font-medium transition-colors ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {fileSource === "upload" && (
              <div className="mt-2 flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-600 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-colors">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>Choose files</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const list = e.target.files ? Array.from(e.target.files) : [];
                      setAttachmentFiles((prev) => [...prev, ...list]);
                    }}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-500">
                  {attachmentFiles.length > 0
                    ? `${attachmentFiles.length} file${attachmentFiles.length === 1 ? "" : "s"} attached`
                    : "Up to 200MB per file"}
                </span>
              </div>
            )}
            {fileSource === "dropbox" && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={openDropboxChooser}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/dropbox.svg" alt="" className="h-3.5 w-3.5" />
                  Open Dropbox chooser
                </button>
                <p className="mt-1 text-[10px] text-slate-500">
                  Select files from your Dropbox. We&apos;ll store the download links with the order.
                </p>
              </div>
            )}
            {fileSource === "gdrive" && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={openGoogleDrivePicker}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/googledrive.svg" alt="" className="h-3.5 w-3.5" />
                  Open Drive picker
                </button>
                <p className="mt-1 text-[10px] text-slate-500">
                  Select files from your Google Drive. We&apos;ll store the download links with the order.
                </p>
              </div>
            )}
            {fileSource === "link" && (
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="Paste any file transfer link (WeTransfer, Dropbox, etc.)..."
                className="mt-2 w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
          </div>
          {attachmentFiles.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachmentFiles.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1"
                >
                  <span className="truncate">{f.name} <span className="text-slate-400">({Math.round(f.size / 1024)}KB)</span></span>
                  <button
                    type="button"
                    onClick={() => setAttachmentFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {cloudLinks.length > 0 && (
            <ul className="mt-2 space-y-1">
              {cloudLinks.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1"
                >
                  <span className="truncate">{f.name}{f.size ? <span className="text-slate-400"> ({(f.size / 1024).toFixed(0)}KB)</span> : null}</span>
                  <button
                    type="button"
                    onClick={() => setCloudLinks((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Final total</p>
          <p className="text-[10px] text-slate-400">
            {service?.pageUnit === "page" ? `${effectivePages} page${effectivePages === 1 ? "" : "s"}` : `${effectivePages} ${service?.pageUnit ?? "units"}`} · {level?.name ?? "-"}
            {subject ? ` · ${subject}` : ""} · <span className="capitalize">{deadlineInfo.type}</span>
          </p>
        </div>
        <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalPrice)}</div>
      </div>

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          size="lg"
          className="w-full sm:w-auto"
        >
          {submitting ? "Saving..." : ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-slate-500 text-center sm:text-left">
          {requireAuth ? "You'll be asked to sign in before checkout." : "Save the order and proceed to checkout."}
        </p>
      </div>
    </Card>
    </>
  );
}
