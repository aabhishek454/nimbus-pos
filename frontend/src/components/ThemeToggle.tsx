"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

import { dispatchThemeChange } from "@/components/ThemeProvider";
import { cx } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "nimbus-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      return;
    }

    setTheme(window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  const toggleTheme = () => {
    setTheme(nextTheme);
    dispatchThemeChange(nextTheme);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={toggleTheme}
      type="button"
      className="glass-panel inline-flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
      aria-label="Toggle theme"
    >
      <div
        className={cx(
          "relative flex h-7 w-14 items-center rounded-full border transition-colors",
          theme === "dark"
            ? "border-white/10 bg-white/10"
            : "border-black/10 bg-black/5"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="absolute left-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg"
          style={{ x: theme === "dark" ? 24 : 0 }}
        >
          {theme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
        </motion.span>
      </div>
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
    </motion.button>
  );
}
