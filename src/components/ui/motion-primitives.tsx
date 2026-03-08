import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Stagger container for lists/grids
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Fade-up item for stagger lists
export const FadeUpItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      {...props}
    />
  )
);
FadeUpItem.displayName = "FadeUpItem";

// Hover-lift card wrapper — Apple-style subtle lift + shadow
export function HoverCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={{
        y: -2,
        scale: 1.01,
        transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
    >
      {children}
    </motion.div>
  );
}

// Icon button press — satisfying tap
export function PressableIcon({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.9, transition: { duration: 0.1 } }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// Section fade-in on mount
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}
