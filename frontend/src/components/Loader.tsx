"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import GlassCard from "@/components/GlassCard";

type LoaderProps = {
  label?: string;
};

export default function Loader({ label = "Loading workspace..." }: LoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="max-w-sm text-center" hover={false}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--button-secondary)]"
        >
          <Loader2 className="h-6 w-6 text-[var(--accent)]" />
        </motion.div>
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      </GlassCard>
    </div>
  );
}
