export default function BlogPostLoading() {
  return (
    <div className="animate-fade-in">
      <header className="bg-gradient-to-b from-emerald-50/30 via-white to-white border-b border-slate-200/70">
        <div className="container-x relative pt-10 pb-10">
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="mt-6 max-w-3xl space-y-4">
            <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="h-12 w-full rounded bg-slate-200 animate-pulse" />
            <div className="h-12 w-4/5 rounded bg-slate-200 animate-pulse" />
            <div className="h-5 w-full max-w-2xl rounded bg-slate-200 animate-pulse" />
            <div className="h-5 w-3/4 max-w-2xl rounded bg-slate-200 animate-pulse" />
            <div className="flex gap-3 pt-2">
              <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="container-x mt-8">
        <div className="aspect-[16/8] sm:aspect-[16/7] rounded-2xl bg-slate-100 animate-pulse" />
      </div>

      <div className="container-x mt-10">
        <div className="grid lg:grid-cols-[1fr_240px] gap-10">
          <div className="max-w-2xl space-y-4">
            <div className="p-5 rounded-2xl border border-emerald-200/60 bg-emerald-50/30">
              <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-slate-200 animate-pulse" />
                <div className="h-3.5 w-2/3 rounded bg-slate-200 animate-pulse ml-4" />
                <div className="h-3.5 w-1/2 rounded bg-slate-200 animate-pulse ml-4" />
                <div className="h-3.5 w-3/5 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-11/12 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-10/12 rounded bg-slate-200 animate-pulse" />
              <div className="h-7 w-1/2 rounded bg-slate-200 animate-pulse mt-6" />
              <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-11/12 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-9/12 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between">
              <div className="h-6 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse" />
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="h-40 rounded-2xl border border-slate-200 bg-white animate-pulse" />
              <div className="h-32 rounded-2xl border border-slate-200 bg-white animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
