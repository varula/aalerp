import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedValueProps {
  value: number | string;
  className?: string;
  flash?: boolean;
  format?: (v: number | string) => string;
}

/**
 * Displays a value that animates (pop + flash) when it changes.
 */
export function AnimatedValue({ value, className, flash = true, format }: AnimatedValueProps) {
  const prevRef = useRef(value);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      if (flash) {
        setIsChanged(true);
        const t = setTimeout(() => setIsChanged(false), 800);
        return () => clearTimeout(t);
      }
    }
  }, [value, flash]);

  const display = format ? format(value) : String(value);

  return (
    <span
      className={cn(
        "inline-block transition-colors duration-300",
        isChanged && "animate-number-pop",
        className,
      )}
    >
      {display}
    </span>
  );
}

interface LiveIndicatorProps {
  lastUpdate: Date;
  className?: string;
}

export function LiveIndicator({ lastUpdate, className }: LiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
        Live
      </span>
      <span className="text-[10px] text-muted-foreground font-mono">
        {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>
    </div>
  );
}
