"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, ClipboardList, User, Loader2, Store } from 'lucide-react';
import { getStoredToken } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const token = getStoredToken();
        if (!token) {
            window.location.href = '/login/employee';
        }
    }, []);

    if (!isClient) return (
        <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
        </div>
    );

    const navItems = [
        { href: '/employee/pos', label: 'POS', icon: ShoppingCart },
        { href: '/employee/dashboard', label: 'Orders', icon: ClipboardList },
        { href: '/employee/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--primary)] selection:text-white pb-24 md:pb-0 md:pl-20">
            {/* Desktop Side Mini-Nav */}
            <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center border-r border-[var(--glass-border)] bg-[var(--bg-primary)]/40 backdrop-blur-2xl z-50 py-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent-2)] flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(79,121,255,0.4)] mb-10">
                    <Store className="text-white w-7 h-7" />
                </div>

                <nav className="flex flex-col gap-6">
                    {navItems.map((item) => (
                        <Link 
                            key={item.href}
                            href={item.href} 
                            className={`p-3 rounded-2xl transition-all group relative ${pathname === item.href ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]'}`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-[var(--glass-border)]">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto space-y-6 flex flex-col items-center">
                    <ThemeToggle />
                </div>
            </aside>

            {/* Mobile Top Header */}
            <nav className="md:hidden sticky top-0 z-50 backdrop-blur-2xl bg-[var(--bg-primary)]/60 border-b border-[var(--glass-border)] h-14 flex items-center justify-between px-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent-2)] flex items-center justify-center shadow-md">
                        <Store className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">Nimbus <span className="text-[10px] uppercase text-[var(--primary)] font-black">POS</span></span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                </div>
            </nav>

            {/* Main Content */}
            <main className="md:min-h-screen relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="p-4 md:p-8"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Navigation - iOS style */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 backdrop-blur-3xl bg-[var(--bg-secondary)]/80 border border-[var(--glass-border)] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] safe-area-mb">
                <div className="flex justify-around items-center h-20 px-4">
                    {navItems.map((item) => (
                        <Link 
                            key={item.href}
                            href={item.href} 
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 relative ${pathname === item.href ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
                        >
                            <item.icon className={`w-6 h-6 transition-transform duration-300 ${pathname === item.href ? 'scale-110 drop-shadow-[0_0_12px_rgba(79,121,255,0.6)]' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                            {pathname === item.href && (
                                <motion.div 
                                    layoutId="nav_active"
                                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]"
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
