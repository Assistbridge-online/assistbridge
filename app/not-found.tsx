import Link from "next/link";
import { Home, Search, MessageCircle } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-primary-50/40 to-white px-4 py-24">
        <div className="text-center max-w-xl">
          <div className="inline-flex items-center justify-center">
            <span className="text-[140px] md:text-[180px] font-bold gradient-text leading-none">404</span>
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900">Page not found</h1>
          <p className="mt-3 text-slate-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. But we&apos;re here to help. Let&apos;s get you back on track.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/"><span className="inline-flex items-center gap-2"><Home className="h-4 w-4" /> Back to home</span></Link>
            </Button>
            <LinkButton href="/services" variant="outline"><Search className="h-4 w-4" /> Browse services</LinkButton>
            <LinkButton href="/contact" variant="ghost"><MessageCircle className="h-4 w-4" /> Contact us</LinkButton>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
