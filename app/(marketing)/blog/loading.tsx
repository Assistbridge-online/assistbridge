import { Section } from "@/components/ui/section";

export default function BlogLoading() {
  return (
    <div className="animate-fade-in">
      <header className="relative overflow-hidden bg-gradient-to-b from-emerald-50/30 via-white to-white border-b border-slate-200/70">
        <div className="container-x relative py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="h-6 w-40 rounded-full bg-slate-200 animate-pulse" />
            <div className="mt-5 h-12 w-3/4 rounded bg-slate-200 animate-pulse" />
            <div className="mt-3 h-12 w-1/2 rounded bg-slate-200 animate-pulse" />
            <div className="mt-5 h-5 w-full max-w-2xl rounded bg-slate-200 animate-pulse" />
            <div className="mt-2 h-5 w-5/6 max-w-2xl rounded bg-slate-200 animate-pulse" />
            <div className="mt-7 h-11 w-full max-w-md rounded-lg bg-slate-200 animate-pulse" />
          </div>
        </div>
      </header>

      <Section className="!py-8">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-sm bg-slate-200 animate-pulse" />
          ))}
        </div>
      </Section>

      <div className="container-x pb-12">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="grid lg:grid-cols-2">
                <div className="aspect-[16/10] lg:aspect-auto bg-slate-100 animate-pulse" />
                <div className="p-7 sm:p-10 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-20 rounded-sm bg-slate-200 animate-pulse" />
                    <div className="h-5 w-20 rounded-sm bg-slate-200 animate-pulse" />
                  </div>
                  <div className="h-7 w-3/4 rounded bg-slate-200 animate-pulse" />
                  <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-slate-200 animate-pulse" />
                  <div className="h-4 w-4/6 rounded bg-slate-200 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white">
                  <div className="aspect-[16/10] bg-slate-100 animate-pulse" />
                  <div className="pt-5 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-5/6 rounded bg-slate-200 animate-pulse" />
                    <div className="h-px w-full bg-slate-200" />
                    <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl border border-slate-200 bg-white animate-pulse" />
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
