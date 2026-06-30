"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  country: string | null;
  quote: string;
  rating: number;
  avatarSeed: number | null;
}

const AUTOPLAY_MS = 4500;

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [perView, setPerView] = useState(1);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 1024) setPerView(3);
      else if (window.innerWidth >= 640) setPerView(2);
      else setPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - perView);

  useEffect(() => {
    if (isPaused) return;
    if (maxIndex === 0) return;
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, isPaused, maxIndex]);

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [maxIndex, index]);

  const goTo = (next: number) => {
    if (next < 0) setIndex(maxIndex);
    else if (next > maxIndex) setIndex(0);
    else setIndex(next);
  };

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const cardWidthPct = 100 / perView;
  const translatePct = -(index * cardWidthPct);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${translatePct}%)`,
          }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="shrink-0 px-3"
              style={{ width: `${cardWidthPct}%` }}
            >
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous testimonial"
        className="absolute left-0 sm:-left-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white shadow-lg ring-1 ring-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary-700 hover:text-white hover:ring-primary-700 transition"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next testimonial"
        className="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white shadow-lg ring-1 ring-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary-700 hover:text-white hover:ring-primary-700 transition"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {maxIndex > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-8 bg-primary-700" : "w-2 bg-slate-300 hover:bg-slate-400"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 h-full flex flex-col">
      <div className="flex gap-0.5 text-amber-500">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-slate-700 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-100">
        <Image
          src={`https://i.pravatar.cc/100?img=${t.avatarSeed ?? 1}`}
          alt={t.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <div className="text-sm font-semibold text-slate-900">{t.name}</div>
          <div className="text-xs text-slate-500">
            {t.role}
            {t.country ? ` · ${t.country}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
