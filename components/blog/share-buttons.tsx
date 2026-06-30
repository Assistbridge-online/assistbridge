"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButtons({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : `/blog/${slug}`;

  function copy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast.success("Link copied");
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mr-1">Share</span>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(typeof document !== "undefined" ? document.title : "")}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
        aria-label="Share on Twitter"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>

      <button
        type="button"
        onClick={copy}
        className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
        aria-label={copied ? "Copied" : "Copy link"}
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
