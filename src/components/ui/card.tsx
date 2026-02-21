import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  accent?: "teal" | "orange" | "blue" | "purple";
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("card-panel p-5", className)}>
      {children}
    </div>
  );
}
