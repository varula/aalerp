import { type ReactNode } from "react";

interface PanelSectionProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function PanelSection({ title, subtitle, icon, children }: PanelSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        {icon}
        <div>
          <h2 className="text-[13px] font-semibold text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
