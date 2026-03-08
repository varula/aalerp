import { type ReactNode } from "react";

interface PanelSectionProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function PanelSection({ title, subtitle, accentColor = "bg-primary", icon, children }: PanelSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-1 rounded-full ${accentColor}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h2>
          </div>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className={`h-px flex-1 max-w-[200px] ${accentColor} opacity-20`} />
      </div>
      {children}
    </div>
  );
}
