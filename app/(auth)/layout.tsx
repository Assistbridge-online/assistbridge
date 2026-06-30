import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-primary-50/30">
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" aria-label="AssistBridge home">
            <Logo width={180} />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-primary-800 transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </main>
      <footer className="w-full py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AssistBridge. Secure authentication.
      </footer>
    </div>
  );
}
