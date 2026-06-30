"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center bg-slate-50 p-4 py-24">
        <div className="text-center max-w-lg">
          <div className="flex justify-center mb-6"><Logo variant="icon" width={56} /></div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-3 text-slate-600">
            We&apos;ve encountered an unexpected error. Please try again, or head back to the homepage.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-slate-400">Error ID: {error.digest}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline"><Link href="/"><span>Back to home</span></Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
