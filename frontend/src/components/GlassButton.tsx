"use client";

import { PropsWithChildren } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

import { cx } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

type GlassButtonProps = PropsWithChildren<HTMLMotionProps<"button">> & {
  variant?: Variant;
  className?: string;
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white shadow-[0_12px_24px_-8px_rgba(79,121,255,0.4)] hover:shadow-[0_20px_40px_-8px_rgba(79,121,255,0.6)] border-none",
  secondary:
    "bg-[var(--glass-bg-strong)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] shadow-sm",
  ghost:
    "bg-transparent text-[var(--text-secondary)] border border-transparent hover:border-[var(--glass-border)] hover:bg-[var(--glass-bg)]",
};

import { haptics } from "@/utils/haptics";

export default function GlassButton({
  children,
  className,
  variant = "primary",
  onClick,
  ...props
}: GlassButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    haptics.light();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      onClick={handleClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-black uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 relative overflow-hidden group",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      {children}
    </motion.button>
  );
}
