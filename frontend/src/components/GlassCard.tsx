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
    <div className="preserve-3d">
      <motion.div
        whileHover={hover ? { 
          rotateY: 5,
          rotateX: -5,
          scale: 1.02,
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.6)" 
        } : undefined}
        whileTap={hover ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cx(
          "glass-panel rounded-[24px] p-6 transition-colors duration-300 relative",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
