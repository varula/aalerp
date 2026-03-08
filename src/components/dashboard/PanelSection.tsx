import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface PanelSectionProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function PanelSection({ title, subtitle, icon, children }: PanelSectionProps) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex items-center gap-2.5">
        {icon && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
          >
            {icon}
          </motion.span>
        )}
        <div>
          <h2 className="text-[13px] font-semibold text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}
