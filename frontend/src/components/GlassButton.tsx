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
    "bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-white shadow-[0_18px_40px_rgba(79,121,255,0.28)]",
  secondary:
    "bg-[var(--button-secondary)] text-[var(--text-primary)] border border-[var(--glass-border)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] border border-transparent hover:border-[var(--glass-border)] hover:bg-[var(--glass-bg)]",
};

export default function GlassButton({
  children,
  className,
  variant = "primary",
  ...props
}: GlassButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
