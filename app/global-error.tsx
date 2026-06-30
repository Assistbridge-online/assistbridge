"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-lg">
          <div className="flex justify-center mb-6"><Logo variant="icon" width={56} /></div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-3 text-slate-600">
            We&apos;ve encountered an unexpected error. Our team has been notified. Please try again, or head back to the homepage.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-slate-400">Error ID: {error.digest}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline"><Link href="/">Back to home</Link></Button>
          </div>
        </div>
      </body>
    </html>
  );
}
