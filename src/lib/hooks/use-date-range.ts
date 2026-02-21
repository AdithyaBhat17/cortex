import { create } from "zustand";
import { subDays, startOfDay } from "date-fns";

interface DateRangeState {
  label: string;
  days: number;
  startDate: Date;
  endDate: Date;
  _hydrated: boolean;
  setRange: (label: string, days: number) => void;
  setCustomRange: (start: Date, end: Date) => void;
  hydrate: () => void;
}

function makeDates(days: number) {
  return {
    startDate: days === 0 ? new Date(0) : startOfDay(subDays(new Date(), days)),
    endDate: new Date(),
  };
}

const DEFAULT_LABEL = "7D";
const DEFAULT_DAYS = 7;

export const useDateRange = create<DateRangeState>((set) => ({
  label: DEFAULT_LABEL,
  days: DEFAULT_DAYS,
  ...makeDates(DEFAULT_DAYS),
  _hydrated: false,

  setRange: (label, days) => {
    try {
      localStorage.setItem("cortex-date-range", JSON.stringify({ label, days }));
    } catch {}
    set({ label, days, ...makeDates(days) });
  },

  setCustomRange: (start, end) => {
    try {
      localStorage.setItem(
        "cortex-date-range",
        JSON.stringify({ label: "Custom", days: -1, start: start.toISOString(), end: end.toISOString() })
      );
    } catch {}
    set({ label: "Custom", days: -1, startDate: startOfDay(start), endDate: end });
  },

  hydrate: () => {
    try {
      const stored = localStorage.getItem("cortex-date-range");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.label === "Custom" && parsed.start && parsed.end) {
          set({
            label: "Custom",
            days: -1,
            startDate: startOfDay(new Date(parsed.start)),
            endDate: new Date(parsed.end),
            _hydrated: true,
          });
        } else if (parsed.label && parsed.days !== undefined) {
          set({ label: parsed.label, days: parsed.days, ...makeDates(parsed.days), _hydrated: true });
        } else {
          set({ _hydrated: true });
        }
      } else {
        set({ _hydrated: true });
      }
    } catch {
      set({ _hydrated: true });
    }
  },
}));
