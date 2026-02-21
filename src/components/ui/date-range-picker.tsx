"use client";

import { useDateRange } from "@/lib/hooks/use-date-range";
import { DATE_RANGES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { useState, useRef, useEffect, useCallback } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

export function DateRangePicker() {
  const { label: activeLabel, setRange, setCustomRange, startDate, endDate } = useDateRange();
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setShowCustom(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowCustom(false);
      }
    }
    if (showCustom) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showCustom, handleEscape]);

  function handleCustomApply() {
    if (customStart && customEnd) {
      setCustomRange(new Date(customStart), new Date(customEnd + "T23:59:59"));
      setShowCustom(false);
    }
  }

  return (
    <div
      className="relative flex items-center gap-0.5 overflow-x-auto rounded-md bg-muted p-0.5"
      role="group"
      aria-label="Date range selection"
    >
      {DATE_RANGES.map(({ label, days }) => (
        <button
          key={label}
          onClick={() => {
            setRange(label, days);
            setShowCustom(false);
          }}
          aria-pressed={activeLabel === label}
          className={cn(
            "shrink-0 rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors duration-150",
            activeLabel === label
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}

      <button
        onClick={() => setShowCustom(!showCustom)}
        aria-pressed={activeLabel === "Custom"}
        aria-expanded={showCustom}
        aria-label={activeLabel === "Custom" ? `Custom range: ${format(startDate, "MMM d")} to ${format(endDate, "MMM d")}` : "Select custom date range"}
        className={cn(
          "shrink-0 rounded-[5px] p-1 transition-colors duration-150",
          activeLabel === "Custom"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <CalendarDaysIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {showCustom && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Custom date range"
          className="card-panel absolute right-0 top-full z-50 mt-2 w-60 p-4"
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Custom range
          </p>
          <div className="space-y-2">
            <div>
              <label htmlFor="date-range-from" className="mb-1 block text-[10px] text-muted-foreground">
                From
              </label>
              <input
                id="date-range-from"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                autoComplete="off"
                className="w-full rounded-md border border-card-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
              />
            </div>
            <div>
              <label htmlFor="date-range-to" className="mb-1 block text-[10px] text-muted-foreground">
                To
              </label>
              <input
                id="date-range-to"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                autoComplete="off"
                className="w-full rounded-md border border-card-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
              />
            </div>
            <button
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
              className="mt-1 w-full rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
