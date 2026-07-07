import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "white" | "icon";
  width?: number;
  height?: number;
}

export function Logo({ className, variant = "default", width = 200 }: LogoProps) {
  if (variant === "icon") {
    const s = width;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 140 140"
        width={s}
        height={s}
        className={cn("block", className)}
        role="img"
        aria-label="AssistBridge"
      >
        <path
          d="M 30 100 L 72 22 L 114 100"
          stroke="#1e3a8a"
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="46" y1="72" x2="98" y2="72" stroke="#2563eb" strokeWidth="11" strokeLinecap="round" />
        <circle cx="72" cy="22" r="9" fill="#06b6d4" />
      </svg>
    );
  }

  return (
    <Image
      src="/TM.png"
      alt="AssistBridge"
      width={width}
      height={width}
      className={cn("block", className)}
      priority
    />
  );
}
