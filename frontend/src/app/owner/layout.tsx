"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, LogOut, Loader2 } from 'lucide-react';
import { clearSession, getStoredToken } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import GlassButton from '@/components/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';

import SkeletonLoader from '@/components/SkeletonLoader';
import { haptics } from '@/utils/haptics';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const token = getStoredToken();
        if (!token) {
            window.location.href = '/login/owner';
        }
    }, []);

    const handleLogout = () => {
        haptics.medium();
        clearSession();
        window.location.href = '/';
    };

    if (!isClient) return (
        <div className="flex h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-10 gap-6">
            <SkeletonLoader className="h-12 w-64" />
            <SkeletonLoader className="h-full w-full max-w-7xl" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--primary)] selection:text-white pb-24 sm:pb-0 relative overflow-hidden">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 backdrop-blur-3xl bg-[var(--bg-primary)]/40 border-b border-[var(--glass-border)] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-10">
                            <div className="flex-shrink-0 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent-2)] flex items-center justify-center shadow-lg">
                                    <span className="text-white font-black text-xl leading-none">N</span>
                                </div>
                                <span className="font-black text-xl tracking-tighter hidden sm:block text-[var(--text-primary)]">
                                    NIMBUS<span className="text-[var(--primary)] text-[10px] ml-1.5 uppercase tracking-widest font-black opacity-80">OWNER</span>
                                </span>
                            </div>

                            {/* Desktop Nav Links */}
                            <div className="hidden sm:flex space-x-2">
                                {[
                                    { href: '/owner/dashboard', label: 'InSIGHTS', icon: LayoutDashboard },
                                    { href: '/owner/menu', label: 'MENU', icon: UtensilsCrossed },
                                ].map((item) => (
                                    <Link 
                                        key={item.href}
                                        href={item.href} 
                                        onClick={() => haptics.light()}
                                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pathname === item.href ? 'bg-[var(--primary)] text-white shadow-[0_8px_16px_rgba(79,121,255,0.3)] border border-[var(--primary)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)] border border-transparent'}`}
                                    >
                                        <item.icon className="w-4 h-4" /> {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <GlassButton variant="secondary" onClick={handleLogout} className="!py-2 !px-4 font-black text-[9px] uppercase tracking-widest h-10 text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/30">
                                <LogOut className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Terminate</span>
                            </GlassButton>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Navigation - iOS style */}
            <div className="sm:hidden fixed bottom-6 left-6 right-6 z-50 backdrop-blur-3xl bg-[var(--bg-secondary)]/80 border border-[var(--glass-border)] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] safe-area-mb">
                <div className="flex justify-around items-center h-20 px-4">
                    {[
                        { href: '/owner/dashboard', label: 'Insights', icon: LayoutDashboard },
                        { href: '/owner/menu', label: 'Menu', icon: UtensilsCrossed },
                    ].map((item) => (
                        <Link 
                            key={item.href}
                            href={item.href} 
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 relative ${pathname === item.href ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
                        >
                            <item.icon className={`w-6 h-6 transition-transform duration-300 ${pathname === item.href ? 'scale-110 drop-shadow-[0_0_12px_rgba(79,121,255,0.6)]' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                            {pathname === item.href && (
                                <motion.div 
                                    layoutId="owner_nav_active"
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
