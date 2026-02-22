"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface HeightInputProps {
  value: number | null;
  onChange: (cm: number) => void;
  compact?: boolean;
}

function cmToFtIn(cm: number) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return { ft, in: inches === 12 ? 0 : inches, ftAdjusted: inches === 12 ? ft + 1 : ft };
}

function ftInToCm(ft: number, inches: number) {
  return Math.round((ft * 12 + inches) * 2.54 * 10) / 10;
}

export function HeightInput({ value, onChange, compact }: HeightInputProps) {
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const [cmInput, setCmInput] = useState(value?.toString() ?? "");
  const [ftInput, setFtInput] = useState(() => {
    if (!value) return { ft: "", in: "" };
    const { ftAdjusted, in: inches } = cmToFtIn(value);
    return { ft: ftAdjusted.toString(), in: inches.toString() };
  });

  const handleCmChange = useCallback(
    (val: string) => {
      setCmInput(val);
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 50 && num <= 300) {
        onChange(num);
        const { ftAdjusted, in: inches } = cmToFtIn(num);
        setFtInput({ ft: ftAdjusted.toString(), in: inches.toString() });
      }
    },
    [onChange]
  );

  const handleFtChange = useCallback(
    (ft: string, inches: string) => {
      setFtInput({ ft, in: inches });
      const f = parseInt(ft) || 0;
      const i = parseInt(inches) || 0;
      if (f > 0) {
        const cm = ftInToCm(f, i);
        if (cm >= 50 && cm <= 300) {
          setCmInput(cm.toString());
          onChange(cm);
        }
      }
    },
    [onChange]
  );

  const inputClass =
    "w-full rounded-md border border-card-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Height (cm)"
          value={cmInput}
          onChange={(e) => handleCmChange(e.target.value)}
          className={cn(inputClass, "w-24")}
          min={50}
          max={300}
          step={0.1}
        />
        <span className="text-[10px] text-muted-foreground">cm</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-md bg-muted p-0.5 w-fit">
        {(["cm", "ft"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={cn(
              "rounded-[5px] px-3 py-1 text-[11px] font-medium transition-colors duration-150",
              unit === u
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {u === "cm" ? "cm" : "ft / in"}
          </button>
        ))}
      </div>

      {unit === "cm" ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="175"
            value={cmInput}
            onChange={(e) => handleCmChange(e.target.value)}
            className={cn(inputClass, "w-28")}
            min={50}
            max={300}
            step={0.1}
          />
          <span className="text-xs text-muted-foreground">cm</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="5"
            value={ftInput.ft}
            onChange={(e) => handleFtChange(e.target.value, ftInput.in)}
            className={cn(inputClass, "w-16")}
            min={1}
            max={8}
          />
          <span className="text-xs text-muted-foreground">ft</span>
          <input
            type="number"
            placeholder="9"
            value={ftInput.in}
            onChange={(e) => handleFtChange(ftInput.ft, e.target.value)}
            className={cn(inputClass, "w-16")}
            min={0}
            max={11}
          />
          <span className="text-xs text-muted-foreground">in</span>
        </div>
      )}
    </div>
  );
}
