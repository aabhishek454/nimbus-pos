"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Shield, Activity, Users, Store, DollarSign, Loader2, AlertCircle, RefreshCw, LogOut, CheckCircle2, UserCheck, Check, Fingerprint, XCircle, Trash2, PowerOff, FileText } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { clearSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/utils/currency';

import AnimatedPage from '@/components/AnimatedPage';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>({ totalBusinesses: 0, totalUsers: 0, totalOrders: 0, monthlyRevenue: 0 });
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [pendingOwners, setPendingOwners] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [employeeActivity, setEmployeeActivity] = useState<string[]>([]);
    const [businessPerformance, setBusinessPerformance] = useState<any[]>([]);
    const [allOrders, setAllOrders] = useState<any[]>([]);
    
    // Filters
    const [dateFilter, setDateFilter] = useState<'today'|'7days'|'monthly'>('monthly');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [statsRes, businessesRes, activityRes, pendingRes, usersRes, ordersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/businesses'),
                api.get('/admin/activity'),
                api.get('/admin/pending-owners'),
                api.get('/admin/users'),
                api.get(`/admin/orders?dateFilter=${dateFilter}`)
            ]);
            setStats(statsRes.data.data);
            setBusinesses(businessesRes.data.data);
            setEmployeeActivity(activityRes.data.data.employeeActivity);
            setBusinessPerformance(activityRes.data.data.businessPerformance);
            setPendingOwners(pendingRes.data.data);
            setUsers(usersRes.data.data);
            setAllOrders(ordersRes.data.data);
        } catch (err: any) {
            setError('Failed to load admin dashboard. Ensure you are logged in as Admin.');
            toast.error('Access Denied');
        } finally {
            setLoading(false);
        }
    };

    const silentFetchData = async () => {
        try {
            const [statsRes, businessesRes, activityRes, pendingRes, usersRes, ordersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/businesses'),
                api.get('/admin/activity'),
                api.get('/admin/pending-owners'),
                api.get('/admin/users'),
                api.get(`/admin/orders?dateFilter=${dateFilter}`)
            ]);
            setStats(statsRes.data.data);
            setBusinesses(businessesRes.data.data);
            setEmployeeActivity(activityRes.data.data.employeeActivity);
            setBusinessPerformance(activityRes.data.data.businessPerformance);
            setPendingOwners(pendingRes.data.data);
            setUsers(usersRes.data.data);
            setAllOrders(ordersRes.data.data);
        } catch (err) { }
    };

    useEffect(() => {
        fetchData();
        let interval: NodeJS.Timeout;
        const poll = () => {
            if (document.visibilityState === 'visible') silentFetchData();
        };
        interval = setInterval(poll, 15000);
        return () => clearInterval(interval);
    }, [dateFilter]);

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/admin/approve-owner/${id}`);
            toast.success('Owner Approved!', { icon: '✨' });
            silentFetchData();
        } catch (err) { toast.error('Failed to approve owner'); }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you select you want to totally delete this pending request?')) return;
        try {
            await api.delete(`/admin/reject-owner/${id}`);
            toast.success('Owner Registration Rejected', { icon: '🗑️' });
            silentFetchData();
        } catch (err) { toast.error('Failed to reject owner'); }
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this tenant workspace?')) return;
        try {
            await api.patch(`/admin/deactivate-owner/${id}`);
            toast.success('Owner Workspace Deactivated', { icon: '⏸️' });
            silentFetchData();
        } catch (err) { toast.error('Failed to deactivate owner'); }
    };

    const handleDeleteOwner = async (id: string) => {
        if (!confirm('WARNING: This will obliterate this owner, their business, all employees, and all orders. Proceed?')) return;
        try {
            await api.delete(`/admin/owner/${id}`);
            toast.success('Workspace securely obliterated', { icon: '🔥' });
            silentFetchData();
        } catch (err) { toast.error('Failed to delete owner'); }
    };

    const handleLogout = () => {
        clearSession();
        router.push('/');
    };

    const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
        <GlassCard className="flex items-center group transition-transform hover:scale-105">
            <div className={`p-4 rounded-[20px] ${color} mr-5 transition-transform group-hover:scale-110 shadow-sm`}>
                {icon}
            </div>
            <div>
                <p className="text-[var(--text-secondary)] text-xs font-semibold tracking-wide uppercase">{title}</p>
                <h3 className="text-3xl font-bold text-[var(--text-primary)] mt-1">{value}</h3>
            </div>
        </GlassCard>
    );

    return (
        <AnimatedPage>
            <Toaster position="top-right" toastOptions={{ className: 'glass-panel text-[var(--text-primary)] border border-[var(--glass-border)]' }} />
            
            <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[var(--glass-border)] gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 glass-panel bg-indigo-500/10 border-indigo-500/20 rounded-2xl shadow-sm">
                        <Shield className="w-8 h-8 text-indigo-500 drop-shadow-md" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Super Admin Console</h1>
                        <p className="text-[var(--text-secondary)] mt-1 font-medium tracking-wide">Full scope platform governance</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <GlassButton variant="ghost" onClick={fetchData} className="flex items-center gap-2 !py-2.5 font-bold text-sm" disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync DB
                    </GlassButton>
                    <GlassButton variant="ghost" onClick={handleLogout} className="flex items-center gap-2 !py-2.5 text-[var(--danger)] font-bold text-sm">
                        <LogOut className="w-4 h-4" /> Terminate Access
                    </GlassButton>
                </div>
            </header>

            {error && (
                <GlassCard className="bg-[var(--danger)]/5 border-[var(--danger)]/20 !p-5 mb-8 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-[var(--danger)] shrink-0" />
                    <p className="text-[var(--danger)] font-semibold">{error}</p>
                </GlassCard>
            )}

            {loading && !stats.totalBusinesses ? (
                <div className="flex flex-col items-center justify-center py-32 text-[var(--accent)]">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-semibold tracking-widest uppercase text-sm text-[var(--text-secondary)]">Fetching platform telemetry...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard title="Total Tenants" value={stats.totalBusinesses} icon={<Store className="w-7 h-7 text-indigo-500" />} color="bg-indigo-500/10" />
                        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-7 h-7 text-blue-500" />} color="bg-blue-500/10" />
                        <StatCard title="Orders Processed" value={stats.totalOrders} icon={<Activity className="w-7 h-7 text-orange-500" />} color="bg-orange-500/10" />
                        <StatCard title="Ecosystem Volume" value={formatINR(businessPerformance.reduce((acc, curr) => acc + curr.totalRevenue, 0))} icon={<DollarSign className="w-7 h-7 text-emerald-500" />} color="bg-emerald-500/10" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Pending Approvals */}
                        <GlassCard className="!p-0 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/50 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-orange-500 drop-shadow-sm" /> Owner Intake Queue
                                </h2>
                                <span className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1 text-[10px] rounded-lg uppercase tracking-widest font-black shadow-sm">
                                    {pendingOwners.length} Pending
                                </span>
                            </div>
                            <div className="overflow-x-auto min-h-[200px]">
                                {pendingOwners.length === 0 ? (
                                    <div className="p-12 text-center text-[var(--text-muted)] h-full flex flex-col items-center justify-center font-medium">
                                        <Shield className="w-12 h-12 mb-4 opacity-20" />
                                        <p>No intake queue tickets pending.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-[var(--glass-bg-strong)] text-[var(--text-muted)] text-sm border-b border-[var(--glass-border)]">
                                                <th className="p-5 font-semibold">Originator ID</th>
                                                <th className="p-5 font-semibold">Business Unit</th>
                                                <th className="p-5 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--glass-border)]">
                                            {pendingOwners.map(owner => (
                                                <tr key={owner._id} className="hover:bg-[var(--glass-bg-strong)] transition-colors duration-200">
                                                    <td className="p-5">
                                                        <p className="text-[var(--text-primary)] font-bold">{owner.name}</p>
                                                        <p className="text-[var(--text-secondary)] text-xs mt-0.5">{owner.email}</p>
                                                    </td>
                                                    <td className="p-5 text-[var(--text-secondary)] font-medium">{owner.businessId?.name || 'Unidentified'}</td>
                                                    <td className="p-5 text-right flex justify-end gap-2">
                                                        <button onClick={() => handleApprove(owner._id)} className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-transparent px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm">
                                                            <Check className="w-4 h-4" /> Allow
                                                        </button>
                                                        <button onClick={() => handleReject(owner._id)} className="bg-[var(--danger)]/10 hover:bg-[var(--danger)] text-[var(--danger)] hover:text-white border border-[var(--danger)]/20 hover:border-transparent px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm">
                                                            <XCircle className="w-4 h-4" /> Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </GlassCard>

                        {/* Tenant Revenue Leaderboard */}
                        <GlassCard className="!p-0 overflow-hidden flex flex-col h-[400px]">
                            <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/50">
                                <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-500 drop-shadow-sm" /> Platform Revenue Breakdown (By Tenant)
                                </h2>
                            </div>
                            <div className="p-0 flex-1 overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-[var(--bg-primary)] z-10 shadow-sm">
                                        <tr className="bg-[var(--glass-bg-strong)] text-[var(--text-muted)] text-sm border-b border-[var(--glass-border)]">
                                            <th className="p-5 font-semibold">Tenant ID</th>
                                            <th className="p-5 font-semibold text-center">Net Orders</th>
                                            <th className="p-5 font-semibold text-right">Throughput Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--glass-border)]">
                                        {businessPerformance.length === 0 ? (
                                            <tr><td colSpan={3} className="p-12 text-center text-[var(--text-muted)] font-medium">No telemetry data.</td></tr>
                                        ) : (
                                            businessPerformance.map((bp) => (
                                                <tr key={bp._id} className="hover:bg-[var(--glass-bg-strong)] transition-colors duration-200">
                                                    <td className="p-5 font-bold text-[var(--text-primary)]">{bp.businessName}</td>
                                                    <td className="p-5 text-center text-[var(--text-secondary)] font-medium">
                                                        <span className="glass-panel px-3 py-1 rounded-full text-xs">{bp.totalOrders}</span>
                                                    </td>
                                                    <td className="p-5 text-right text-emerald-500 font-bold tracking-wide">{formatINR(bp.totalRevenue)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Global Order Telemetry Table */}
                    <GlassCard className="!p-0 overflow-hidden mb-8">
                        <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500 drop-shadow-sm" /> Global Platform Order Ledger
                            </h2>
                            <div className="flex glass-panel rounded-lg p-1 border border-[var(--glass-border)]">
                                {['today', '7days', 'monthly'].map(f => (
                                    <button key={f} onClick={() => setDateFilter(f as any)} className={`px-4 py-1.5 text-xs font-bold rounded-md uppercase tracking-wider transition-all duration-300 ${dateFilter === f ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left relative">
                                <thead className="sticky top-0 bg-[var(--bg-primary)] z-10 shadow-sm">
                                    <tr className="bg-[var(--glass-bg-strong)] text-[var(--text-muted)] text-sm border-b border-[var(--glass-border)]">
                                        <th className="p-5 font-semibold">TID</th>
                                        <th className="p-5 font-semibold">Tenant Node</th>
                                        <th className="p-5 font-semibold">Items / Manifest</th>
                                        <th className="p-5 font-semibold">Status / Stamp</th>
                                        <th className="p-5 font-semibold text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--glass-border)]">
                                    {allOrders.length === 0 ? (
                                        <tr><td colSpan={5} className="p-12 text-center text-[var(--text-muted)] font-medium">No global orders present in timeframe.</td></tr>
                                    ) : (
                                        allOrders.map(o => (
                                            <tr key={o._id} className="hover:bg-[var(--glass-bg-strong)] text-sm transition-colors duration-200">
                                                <td className="p-5 text-[var(--text-muted)] font-mono text-[10px] tracking-widest">{o._id.slice(-6)}</td>
                                                <td className="p-5 font-bold text-[var(--text-primary)]">{o.businessId?.name || 'Unknown'}</td>
                                                <td className="p-5 text-[var(--text-secondary)] max-w-[200px] truncate font-medium">
                                                    {(o.items || []).map((i:any) => `${i.quantity}x ${i.name}`).join(', ')}
                                                </td>
                                                <td className="p-5">
                                                    <p className="text-[var(--text-secondary)] text-xs font-medium">{format(new Date(o.createdAt), 'MMM d, h:mm a')}</p>
                                                    <span className={`px-2.5 py-1 mt-1.5 inline-block text-[9px] uppercase font-bold tracking-widest rounded-md glass-panel border border-[var(--glass-border)] shadow-sm`}>{o.status}</span>
                                                </td>
                                                <td className="p-5 text-right font-black text-emerald-500 tracking-wide text-lg">{formatINR(o.totalAmount)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* All Users View (Danger Controls) */}
                    <GlassCard className="!p-0 overflow-hidden bg-[var(--danger)]/5 border-[var(--danger)]/20 shadow-[0_0_40px_rgba(255,107,129,0.05)] rounded-[28px]">
                        <div className="p-6 border-b border-[var(--danger)]/10 bg-[var(--danger)]/5 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-[var(--danger)] flex items-center gap-2">
                                <Fingerprint className="w-5 h-5" /> Platform Security Roster (Danger Controls)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[var(--danger)]/5 text-[var(--text-muted)] text-sm border-b border-[var(--danger)]/20">
                                        <th className="p-5 font-bold text-[var(--danger)]">Identity Matrix</th>
                                        <th className="p-5 font-bold text-[var(--danger)]">Assigned Role</th>
                                        <th className="p-5 font-bold text-[var(--danger)]">Business Context</th>
                                        <th className="p-5 font-bold text-[var(--danger)] text-right">Executive Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--danger)]/10">
                                    {users.map(user => (
                                        <tr key={user._id} className="hover:bg-[var(--danger)]/10 transition-colors duration-200">
                                            <td className="p-5">
                                                <p className="text-[var(--text-primary)] font-bold">{user.name}</p>
                                                <p className="text-[var(--text-secondary)] text-xs mt-0.5 font-medium">{user.email}</p>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${user.role === 'owner' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'glass-panel text-[var(--text-secondary)]'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-5 text-[var(--text-secondary)] text-sm font-medium">
                                                {user.businessId?.name || 'Null Context'}
                                            </td>
                                            <td className="p-5 flex justify-end gap-3 items-center">
                                                {user.role === 'owner' && user.status === 'approved' && (
                                                    <button onClick={() => handleDeactivate(user._id)} className="bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white border border-orange-500/20 hover:border-transparent px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm" title="Suspend access temporarily">
                                                        <PowerOff className="w-4 h-4" /> Suspend
                                                    </button>
                                                )}
                                                {user.role === 'owner' && (
                                                    <button onClick={() => handleDeleteOwner(user._id)} className="bg-[var(--danger)]/10 hover:bg-[var(--danger)] text-[var(--danger)] hover:text-white border border-[var(--danger)]/20 hover:border-transparent px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm" title="Destructive Protocol">
                                                        <Trash2 className="w-4 h-4" /> Obliterate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </>
            )}
        </AnimatedPage>
    );
}
