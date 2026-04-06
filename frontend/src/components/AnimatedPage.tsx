"use client";

import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

import { cx } from "@/lib/utils";

type AnimatedPageProps = PropsWithChildren<{
  className?: string;
}>;

export default function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={cx("min-h-screen px-4 py-6 md:px-6 md:py-8", className)}
    >
      {children}
    </motion.main>
  );
}
