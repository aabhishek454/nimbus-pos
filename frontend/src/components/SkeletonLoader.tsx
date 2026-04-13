"use client";

import { motion } from "framer-motion";
import { cx } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function SkeletonLoader({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cx(
            "relative overflow-hidden glass-panel bg-white/5 rounded-2xl",
            className
          )}
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
        </div>
      ))}
    </>
  );
}
