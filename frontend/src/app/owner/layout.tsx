"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, LogOut, Loader2 } from 'lucide-react';
import { clearSession, getStoredToken } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import GlassButton from '@/components/GlassButton';

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
        clearSession();
        window.location.href = '/';
    };

    if (!isClient) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[var(--bg-background)] text-[var(--text-primary)] font-sans selection:bg-[var(--primary)] selection:text-white pb-20 sm:pb-0">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--glass-border)] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-blue-600 flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg leading-none">N</span>
                                </div>
                                <span className="font-bold text-xl tracking-tight hidden sm:block text-[var(--text-primary)]">Nimbus<span className="text-[var(--primary)] text-sm ml-1 uppercase tracking-widest font-black">Owner</span></span>
                            </div>

                            {/* Desktop Nav Links */}
                            <div className="hidden sm:flex space-x-2">
                                <Link href="/owner/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${pathname === '/owner/dashboard' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]'}`}>
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>
                                <Link href="/owner/menu" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${pathname === '/owner/menu' ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]'}`}>
                                    <UtensilsCrossed className="w-4 h-4" /> Menu
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <GlassButton variant="secondary" onClick={handleLogout} className="!py-2 !px-3 font-bold text-xs h-9 text-red-500 hover:bg-red-500/10 hover:border-red-500/30">
                                <LogOut className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Logout</span>
                            </GlassButton>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--bg-primary)]/90 border-t border-[var(--glass-border)] safe-area-pb">
                <div className="flex justify-around items-center h-16 px-2">
                    <Link href="/owner/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/owner/dashboard' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                        <LayoutDashboard className={`w-5 h-5 ${pathname === '/owner/dashboard' ? 'drop-shadow-sm' : ''}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                    </Link>
                    <Link href="/owner/menu" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/owner/menu' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                        <UtensilsCrossed className={`w-5 h-5 ${pathname === '/owner/menu' ? 'drop-shadow-sm' : ''}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
