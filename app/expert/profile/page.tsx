"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/dashboard-widgets";
import { DISCIPLINES } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";


export const dynamic = "force-dynamic";
export default function ExpertProfilePage() {
  const [profile, setProfile] = useState({
    headline: "Biostatistician · PhD",
    bio: "PhD in Biostatistics from NUS with 8 years of experience in clinical trial design, survival analysis, and epidemiological research.",
    rate: "95",
    currency: "USD",
    expertise: ["Mathematics & Statistics", "Medicine & Health"] as string[],
    languages: ["English", "Mandarin"] as string[],
    education: "PhD, National University of Singapore",
    yearsExp: "8",
  });

  function save(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Profile saved");
  }

  function toggle(tag: string, field: "expertise" | "languages") {
    setProfile((p) => ({
      ...p,
      [field]: p[field].includes(tag) ? p[field].filter((t) => t !== tag) : [...p[field], tag],
    }));
  }

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Public profile</h1>
      <p className="mt-1 text-slate-600">This is what clients see when they discover you.</p>

      <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-6">
        <form onSubmit={save}>
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Headline</h2>
            <input value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />

            <h2 className="font-semibold text-slate-900 pt-4">Bio</h2>
            <textarea rows={6} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />

            <h2 className="font-semibold text-slate-900 pt-4">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map((d) => (
                <button type="button" key={d} onClick={() => toggle(d, "expertise")} className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition ${profile.expertise.includes(d) ? "bg-accent-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                  {d}
                </button>
              ))}
            </div>

            <h2 className="font-semibold text-slate-900 pt-4">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {["English", "Mandarin", "Spanish", "French", "German", "Japanese", "Korean", "Arabic", "Hindi", "Portuguese", "Russian", "Italian"].map((l) => (
                <button type="button" key={l} onClick={() => toggle(l, "languages")} className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition ${profile.languages.includes(l) ? "bg-accent-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div>
                <h2 className="font-semibold text-slate-900 mb-2">Hourly rate</h2>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="number" value={profile.rate} onChange={(e) => setProfile({ ...profile, rate: e.target.value })} className="w-full h-11 pl-7 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <select value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })} className="h-11 px-3 rounded-lg border border-slate-300 text-sm bg-white">
                    <option>USD</option><option>EUR</option><option>GBP</option><option>AUD</option><option>CAD</option>
                  </select>
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 mb-2">Years of experience</h2>
                <input type="number" value={profile.yearsExp} onChange={(e) => setProfile({ ...profile, yearsExp: e.target.value })} className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 mb-2">Education</h2>
                <input value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })} className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg">Save profile</Button>
            </div>
          </Card>
        </form>

        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Preview</h3>
            <div className="mt-3 flex items-start gap-3">
              <Avatar name="Dr. Sarah Chen" src="https://i.pravatar.cc/100?img=1" size={56} />
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-slate-900">Dr. Sarah Chen</h3>
                  <CheckCircle2 className="h-4 w-4 text-accent-600" />
                </div>
                <p className="text-sm text-slate-600">{profile.headline}</p>
                <div className="mt-1 text-xs text-slate-500">★ {4.9} · {87} jobs</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-700 line-clamp-4">{profile.bio}</p>
            <div className="mt-3 text-sm font-semibold text-slate-900">${profile.rate}<span className="text-slate-500 font-normal">/hr</span></div>
          </Card>
        </aside>
      </div>
    </>
  );
}
