"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, ChevronRight, Shield, Store, UserCircle } from "lucide-react";

import AnimatedPage from "@/components/AnimatedPage";
import GlassCard from "@/components/GlassCard";
import ThemeToggle from "@/components/ThemeToggle";

const portals = [
  {
    href: "/login/owner",
    title: "Owner workspace",
    description:
      "Run operations, staff, expenses, exports, and monthly reporting in one premium control center.",
    icon: <Briefcase className="h-7 w-7 text-white" />,
    accent: "from-blue-500 to-indigo-500",
  },
  {
    href: "/login/employee",
    title: "Employee POS",
    description:
      "Create orders quickly, generate receipts, and keep the counter moving with a focused workflow.",
    icon: <UserCircle className="h-7 w-7 text-white" />,
    accent: "from-emerald-500 to-cyan-500",
  },
  {
    href: "/login/admin",
    title: "Admin console",
    description:
      "Monitor businesses, users, and platform-wide activity in a polished executive view.",
    icon: <Shield className="h-7 w-7 text-white" />,
    accent: "from-rose-500 to-orange-500",
  },
];

export default function Home() {
  return (
    <AnimatedPage className="relative overflow-hidden">
      <div className="absolute right-4 top-4 md:right-8 md:top-8 z-50">
        <ThemeToggle />
      </div>

      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-12 max-w-3xl"
        >
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] shadow-[0_20px_50px_rgba(79,121,255,0.35)]">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-[var(--text-primary)] md:text-6xl">
            Nimbus POS
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            A premium, glass-crafted SaaS workspace for teams that need fast billing, clear owner
            analytics, and an admin experience that feels worth paying for.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.href}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Link href={portal.href} className="block">
                <GlassCard className="h-full min-h-[280px]">
                  <div
                    className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br ${portal.accent}`}
                  >
                    {portal.icon}
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                    {portal.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {portal.description}
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    Enter workspace
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="absolute bottom-4 left-0 w-full px-4 text-center md:bottom-8">
        <p className="text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase md:text-xs">
          Crafted by <span className="text-[var(--text-primary)] font-bold">Abhishek</span> & <span className="text-[var(--text-primary)] font-bold">Vishal</span> • High-Performance SaaS
        </p>
      </footer>
    </AnimatedPage>
  );
}
