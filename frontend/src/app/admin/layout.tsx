"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Store, LogOut, Loader2, ShieldCheck, Activity } from 'lucide-react';
import { clearSession, getStoredToken } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import GlassButton from '@/components/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';

import SkeletonLoader from '@/components/SkeletonLoader';
import { haptics } from '@/utils/haptics';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const token = getStoredToken();
        if (!token) {
            window.location.href = '/login/admin';
        }
    }, []);

    const handleLogout = () => {
        haptics.medium();
        clearSession();
        window.location.href = '/';
    };

    if (!isClient) return (
        <div className="flex h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-10 gap-6">
            <div className="flex gap-4 w-full h-full max-w-7xl">
                <SkeletonLoader className="h-full w-72 hidden md:block" />
                <div className="flex-1 space-y-6">
                    <SkeletonLoader className="h-16 w-full" />
                    <SkeletonLoader className="h-full w-full" />
                </div>
            </div>
        </div>
    );

    const navItems = [
        { href: '/admin/dashboard', label: 'CONSOLE', icon: ShieldCheck },
        { href: '/admin/activity', label: 'HISTORY', icon: Activity },
        { href: '/admin/users', label: 'OPERATORS', icon: Users },
        { href: '/admin/businesses', label: 'TENANTS', icon: Store },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--primary)] selection:text-white pb-24 md:pb-0 md:pl-72 relative overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 flex-col border-r border-[var(--glass-border)] bg-[var(--bg-primary)]/40 backdrop-blur-3xl z-50">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <span className="font-black text-xl tracking-tighter uppercase block leading-none">NIMBUS</span>
                            <span className="text-purple-500 text-[9px] uppercase tracking-[0.2em] font-black opacity-80 mt-1 block">SUPER CONSOLE</span>
                        </div>
                    </div>

                    <nav className="space-y-3">
                        {navItems.map((item) => (
                            <Link 
                                key={item.href}
                                href={item.href} 
                                onClick={() => haptics.light()}
                                className={`flex items-center gap-3.5 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${pathname === item.href ? 'bg-[var(--primary)] text-white shadow-[0_8px_16px_rgba(79,121,255,0.3)] border border-[var(--primary)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)] border border-transparent'}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 space-y-6">
                    <ThemeToggle />
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-3.5 w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all border border-transparent hover:border-[var(--danger)]/20"
                    >
                        <LogOut className="w-5 h-5" /> TERMINATE
                    </button>
                </div>
            </aside>

            {/* Mobile Top Header */}
            <nav className="md:hidden sticky top-0 z-50 backdrop-blur-2xl bg-[var(--bg-primary)]/60 border-b border-[var(--glass-border)] h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-purple-500 w-6 h-6" />
                    <span className="font-bold text-lg">Nimbus <span className="text-[10px] uppercase text-purple-500 font-black">Admin</span></span>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button onClick={handleLogout} className="p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-xl transition-colors"><LogOut className="w-5 h-5" /></button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="p-6 md:p-12 max-w-7xl mx-auto"
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
                                    layoutId="admin_nav_active"
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
