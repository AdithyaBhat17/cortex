import { cn } from "@/lib/utils/cn";

interface CortexLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function CortexLogo({ className, size = "md", showText = true }: CortexLogoProps) {
  const iconSize = size === "sm" ? 22 : size === "md" ? 28 : 48;
  const textClass = size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-2xl";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* Hexagonal ring — outer pointy-top, inner flat-top cutout via evenodd */}
        <path
          fillRule="evenodd"
          d="M24 4L41.32 14V34L24 44L6.68 34V14L24 4Z M35 24L29.5 14.47L18.5 14.47L13 24L18.5 33.53L29.5 33.53Z"
          fill="#f97316"
        />
        {/* Center node */}
        <circle cx="24" cy="24" r="3.5" fill="#f97316" />
      </svg>
      {showText && (
        <span
          className={cn(
            "font-heading font-bold tracking-wider text-foreground",
            textClass
          )}
        >
          CORTEX
        </span>
      )}
    </div>
  );
}
