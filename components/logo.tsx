import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "white" | "icon";
  width?: number;
  height?: number;
}

export function Logo({ className, variant = "default", width = 200, height }: LogoProps) {
  const textFill = variant === "white" ? "#ffffff" : "#1e3a8a";
  const accentFill = "#06b6d4";
  const accent2 = "#2563eb";

  const h = height ?? Math.round((width * 140) / 540);

  if (variant === "icon") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 140 140"
        width={width}
        height={width}
        className={cn("block", className)}
        role="img"
        aria-label="AssistBridge"
      >
        <path
          d="M 30 100 L 72 22 L 114 100"
          stroke={textFill}
          strokeWidth="11"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="46" y1="72" x2="98" y2="72" stroke={accent2} strokeWidth="11" strokeLinecap="round" />
        <circle cx="72" cy="22" r="9" fill={accentFill} />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 540 140"
      width={width}
      height={h}
      className={cn("block", className)}
      role="img"
      aria-label={`${variant === "white" ? "AssistBridge" : "AssistBridge"}`}
    >
      <path
        d="M 30 100 L 72 22 L 114 100"
        stroke={textFill}
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="46" y1="72" x2="98" y2="72" stroke={accent2} strokeWidth="9" strokeLinecap="round" />
      <circle cx="72" cy="22" r="7" fill={accentFill} />
      <text
        x="148"
        y="72"
        fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
        fontSize="42"
        fontWeight="700"
        fill={textFill}
      >
        Assist<tspan fill={accent2}>Bridge</tspan>
      </text>
      <text
        x="148"
        y="98"
        fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
        fontSize="11"
        fontWeight="600"
        fill={variant === "white" ? "#cbd5e1" : "#64748b"}
        letterSpacing="2.5"
      >
        RESEARCH &amp; TECHNICAL ASSISTANCE
      </text>
    </svg>
  );
}
