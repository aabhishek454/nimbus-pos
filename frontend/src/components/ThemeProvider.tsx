"use client";

import { PropsWithChildren, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "nimbus-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const nextTheme = getInitialTheme();
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handler = (event: CustomEvent<Theme>) => {
      setTheme(event.detail);
    };

    window.addEventListener("nimbus-theme-change", handler as EventListener);
    return () => window.removeEventListener("nimbus-theme-change", handler as EventListener);
  }, []);

  return <>{children}</>;
}

export function dispatchThemeChange(theme: Theme): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("nimbus-theme-change", { detail: theme }));
}
