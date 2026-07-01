const keywords = [
  { term: "environmental research", volume: 28321 },
  { term: "google scholar research", volume: 18081 },
  { term: "deep research", volume: 17622 },
  { term: "nano research", volume: 17664 },
  { term: "research paper", volume: 14174 },
  { term: "cancer research", volume: 13040 },
  { term: "gemini deep research", volume: 12743 },
  { term: "pharmacological research", volume: 12041 },
  { term: "academic research skills", volume: 10745 },
  { term: "research methodology", volume: 10041 },
  { term: "research proposal", volume: 8048 },
  { term: "qualitative research", volume: 8258 },
  { term: "educational research topics", volume: 8596 },
  { term: "research scholar", volume: 7121 },
  { term: "fundamental research", volume: 7021 },
  { term: "stem cell research therapy", volume: 6985 },
  { term: "market research", volume: 6781 },
  { term: "research ai", volume: 6154 },
  { term: "cell research", volume: 5975 },
  { term: "quantitative research", volume: 5923 },
  { term: "research design", volume: 5714 },
  { term: "consensus ai research", volume: 5355 },
  { term: "research portal", volume: 4598 },
  { term: "research map", volume: 4345 },
  { term: "applied food research", volume: 4084 },
  { term: "what is research", volume: 3721 },
  { term: "translational research", volume: 3736 },
  { term: "research papers", volume: 3446 },
  { term: "internet research", volume: 2280 },
  { term: "types of research", volume: 2515 },
  { term: "clinical research", volume: 2553 },
  { term: "research meaning", volume: 1482 },
  { term: "biology research", volume: 1804 },
  { term: "sports research", volume: 3307 },
  { term: "cloud research", volume: 3384 },
  { term: "google ai research", volume: 3453 },
  { term: "research gap", volume: 3104 },
  { term: "research verified", volume: 3124 },
  { term: "marine environmental research", volume: 3007 },
  { term: "informative research", volume: 2758 },
  { term: "genome research", volume: 2786 },
  { term: "pediatric research", volume: 2188 },
  { term: "veterinary research", volume: 2434 },
  { term: "zoological research", volume: 3263 },
];

const maxVolume = Math.max(...keywords.map((k) => k.volume));
const minVolume = Math.min(...keywords.map((k) => k.volume));

function sizeClass(volume: number): string {
  const ratio = (volume - minVolume) / (maxVolume - minVolume);
  if (ratio >= 0.9) return "text-lg md:text-xl font-bold";
  if (ratio >= 0.7) return "text-base md:text-lg font-semibold";
  if (ratio >= 0.5) return "text-sm md:text-base font-medium";
  if (ratio >= 0.3) return "text-sm font-normal";
  return "text-xs font-normal";
}

function opacityClass(volume: number): string {
  const ratio = (volume - minVolume) / (maxVolume - minVolume);
  if (ratio >= 0.7) return "text-slate-900";
  if (ratio >= 0.4) return "text-slate-600";
  return "text-slate-500";
}

export function TrendingTopics() {
  return (
    <section className="bg-slate-50 border-y border-slate-200">
      <div className="container-x py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Trending on the web
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            What millions search for every day
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            These are the research topics people type into search engines most often.
            Whatever yours is — AssistBridge has a vetted expert ready.
          </p>
        </div>

        <div className="mt-10 max-w-4xl mx-auto flex flex-wrap justify-center items-center gap-x-4 gap-y-3">
          {keywords.map((k) => (
            <span
              key={k.term}
              className={`${sizeClass(k.volume)} ${opacityClass(
                k.volume
              )} inline-block rounded-full px-3 py-1 bg-white ring-1 ring-slate-200 hover:ring-slate-400 hover:shadow-sm transition-all cursor-default`}
            >
              {k.term}
            </span>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Based on global search volume data &bull; 44 trending research topics
        </p>
      </div>
    </section>
  );
}
