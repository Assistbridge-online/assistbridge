import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        hover && "transition-all duration-300 hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
