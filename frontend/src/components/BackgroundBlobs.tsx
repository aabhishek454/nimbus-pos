"use client";

import { motion } from "framer-motion";

export default function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Primary Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.2, 0.15],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/30 blur-[120px]"
      />
      
      {/* Secondary Glow */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1],
          x: [0, -40, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[100px]"
      />

      {/* Tertiary Moving Light */}
      <motion.div
        animate={{
          x: ["-100%", "100%"],
          y: ["-20%", "120%"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 w-1 h-1 bg-white/10 blur-[50px] rotate-45 scale-[100]"
      />
    </div>
  );
}
