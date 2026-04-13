"use client";

import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

import { cx } from "@/lib/utils";

type GlassCardProps = PropsWithChildren<{
  className?: string;
  hover?: boolean;
}>;

export default function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02, boxShadow: "0 20px 40px rgba(79,121,255,0.12)" } : undefined}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={cx("glass-panel rounded-[28px] p-6 transition-colors duration-300", className)}
    >
      {children}
    </motion.div>
  );
}
