import { Logo } from "@/components/logo";

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Logo variant="icon" width={48} className="animate-float" />
      <div className="mt-5 h-8 w-8 rounded-full border-2 border-primary-200 border-t-primary-700 animate-spin" />
    </main>
  );
}
