"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { clearSession, getStoredToken } from '@/lib/auth';
import {
    Users, Banknote, Briefcase, TrendingUp, DollarSign, Plus, Loader2,
    AlertCircle, RefreshCw, Trophy, FileText, Trash2, Package, Clock,
    Brain, Download, BarChart3, Bell
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { formatINR } from '@/utils/currency';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import AnimatedPage from '@/components/AnimatedPage';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';
import ThemeToggle from '@/components/ThemeToggle';

const CHART_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export default function OwnerDashboard() {
    // Core data
    const [finances, setFinances] = useState<any>({ totalSales: 0, totalCash: 0, totalOnline: 0 });
    const [employees, setEmployees] = useState<any[]>([]);
    const [employeeActivity, setEmployeeActivity] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    // Analytics data
    const [salesTrend, setSalesTrend] = useState<any[]>([]);
    const [bestSellers, setBestSellers] = useState<any[]>([]);
    const [peakHours, setPeakHours] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);

    // Inventory data
    const [inventory, setInventory] = useState<any[]>([]);
    const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

    // Attendance data
    const [attendance, setAttendance] = useState<any[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'inventory' | 'staffing'>('overview');
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'monthly'>('monthly');
    const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    // Employee form
    const [empName, setEmpName] = useState('');
    const [empEmail, setEmpEmail] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [empLoading, setEmpLoading] = useState(false);

    // Inventory form
    const [invName, setInvName] = useState('');
    const [invQty, setInvQty] = useState(0);
    const [invUnit, setInvUnit] = useState('pcs');
    const [invThreshold, setInvThreshold] = useState(5);
    const [invLoading, setInvLoading] = useState(false);

    const dateFilterRef = React.useRef(dateFilter);
    const trendPeriodRef = React.useRef(trendPeriod);
    const activeTabRef = React.useRef(activeTab);

    React.useEffect(() => { dateFilterRef.current = dateFilter; }, [dateFilter]);
    React.useEffect(() => { trendPeriodRef.current = trendPeriod; }, [trendPeriod]);
    React.useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

    const fetchCoreData = React.useCallback(async () => {
        try {
            const [summaryRes, empRes, activityRes, ordersRes] = await Promise.all([
                api.get('/orders/summary'),
                api.get('/auth/employees'),
                api.get('/orders/employee-activity'),
                api.get(`/orders?dateFilter=${dateFilterRef.current}`)
            ]);
            setFinances(summaryRes.data.data);
            setEmployees(empRes.data.data);
            setEmployeeActivity(activityRes.data.data);
            setOrders(ordersRes.data.data);
        } catch (e) { }
    }, []);

    const fetchAnalytics = React.useCallback(async () => {
        try {
            const [trendRes, sellersRes, peakRes, insightsRes] = await Promise.all([
                api.get(`/analytics/sales-trend?period=${trendPeriodRef.current}`),
                api.get('/analytics/best-sellers'),
                api.get('/analytics/peak-hours'),
                api.get('/analytics/insights')
            ]);
            setSalesTrend(trendRes.data.data);
            setBestSellers(sellersRes.data.data);
            setPeakHours(peakRes.data.data.slice(0, 12).sort((a: any, b: any) => a.hour - b.hour));
            setInsights(insightsRes.data.data);
        } catch (e) { }
    }, []);

    const fetchInventory = React.useCallback(async () => {
        try {
            const res = await api.get('/inventory');
            setInventory(res.data.data);
            setLowStockAlerts(res.data.lowStockAlerts || []);
        } catch (e) { }
    }, []);

    const fetchAttendance = React.useCallback(async () => {
        try {
            const res = await api.get('/attendance?dateFilter=7days');
            setAttendance(res.data.data);
        } catch (e) { }
    }, []);

    const fetchAll = React.useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchCoreData(), fetchAnalytics(), fetchInventory(), fetchAttendance()]);
        setLoading(false);
    }, [fetchCoreData, fetchAnalytics, fetchInventory, fetchAttendance]);

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        fetchCoreData();
    }, [dateFilter]);

    useEffect(() => {
        fetchAnalytics();
    }, [trendPeriod]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchCoreData();
                if (activeTabRef.current === 'analytics') fetchAnalytics();
                if (activeTabRef.current === 'inventory') fetchInventory();
                if (activeTabRef.current === 'staffing') fetchAttendance();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchCoreData, fetchAnalytics, fetchInventory, fetchAttendance]);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmpLoading(true);
        try {
            await api.post('/auth/add-employee', { name: empName, email: empEmail, password: empPassword });
            toast.success('Employee added!', { icon: '✨' });
            setEmpName(''); setEmpEmail(''); setEmpPassword('');
            fetchCoreData();
        } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setEmpLoading(false); }
    };

    const handleDeleteEmployee = async (id: string, name: string) => {
        if (!confirm(`Delete ${name}?`)) return;
        try { await api.delete(`/auth/employee/${id}`); toast.success('Deleted', { icon: '🗑️' }); fetchCoreData(); }
        catch { toast.error('Failed'); }
    };

    const handleAddInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        setInvLoading(true);
        try {
            await api.post('/inventory', { itemName: invName, quantity: invQty, unit: invUnit, lowStockThreshold: invThreshold });
            toast.success('Item added!', { icon: '📦' });
            setInvName(''); setInvQty(0); setInvThreshold(5);
            fetchInventory();
        } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setInvLoading(false); }
    };

    const handleDeleteInventory = async (id: string) => {
        if (!confirm('Delete this inventory item?')) return;
        try { await api.delete(`/inventory/${id}`); toast.success('Deleted', { icon: '🗑️' }); fetchInventory(); }
        catch { toast.error('Failed'); }
    };

    const handleExportExcel = async () => {
        try {
            const token = getStoredToken();
            const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
            window.open(`${backendUrl}/export/orders?token=${token}`, '_blank');
            toast.success('Excel download started!', { icon: '📊' });
        } catch { toast.error('Export failed'); }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="glass-panel rounded-xl p-3 shadow-xl backdrop-blur-xl bg-[var(--glass-bg-strong)] border border-[var(--glass-border)]">
                <p className="text-[var(--text-secondary)] text-xs mb-1">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name?.includes('Sales') ? formatINR(p.value) : p.value}</p>
                ))}
            </div>
        );
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics & AI', icon: <Brain className="w-4 h-4" /> },
        { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
        { id: 'staffing', label: 'Staffing', icon: <Users className="w-4 h-4" /> },
    ];

    return (
        <AnimatedPage>
            <Toaster position="top-center" toastOptions={{ className: 'glass-panel text-[var(--text-primary)] border border-[var(--glass-border)]' }} />

            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
                        <Briefcase className="w-8 h-8 text-[var(--accent)]" /> Command Center
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1 tracking-wide">Full business intelligence & operations</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {lowStockAlerts.length > 0 && (
                        <div className="flex items-center gap-1 px-3 py-2 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-xl text-[var(--danger)] text-xs font-bold">
                            <Bell className="w-4 h-4" /> {lowStockAlerts.length} Low Stock
                        </div>
                    )}
                    <ThemeToggle />
                    <GlassButton variant="secondary" onClick={handleExportExcel} className="!py-2 border border-[var(--glass-border)] text-emerald-500 font-bold">
                        <Download className="w-4 h-4" /> Export Excel
                    </GlassButton>
                    <GlassButton variant="ghost" onClick={fetchAll} disabled={loading} className="!py-2 font-bold text-[var(--text-primary)]">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
                    </GlassButton>
                    <GlassButton variant="ghost" onClick={() => { clearSession(); window.location.href = '/'; }} className="!py-2 text-red-500 font-bold">
                        Logout
                    </GlassButton>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-8 glass-panel p-1.5 rounded-[20px] w-fit border border-[var(--glass-border)]">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-lg scale-[1.02]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ========== OVERVIEW TAB ========== */}
            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                            { title: 'Total Revenue', value: formatINR(finances.totalSales), icon: <TrendingUp className="w-7 h-7 text-emerald-500" />, color: 'bg-emerald-500/10' },
                            { title: 'Cash Intake', value: formatINR(finances.totalCash), icon: <Banknote className="w-7 h-7 text-[var(--accent)]" />, color: 'bg-[var(--accent)]/10' },
                            { title: 'Online Sales', value: formatINR(finances.totalOnline), icon: <DollarSign className="w-7 h-7 text-blue-500" />, color: 'bg-blue-500/10' },
                        ].map((card, i) => (
                            <GlassCard key={i} className="flex items-center group">
                                <div className={`p-4 rounded-[20px] ${card.color} mr-5 transition-transform group-hover:scale-110`}>{card.icon}</div>
                                <div>
                                    <p className="text-[var(--text-secondary)] text-sm font-medium">{card.title}</p>
                                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">{card.value}</h3>
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 space-y-8">
                            {/* Employee Performance */}
                            <GlassCard className="!p-0 overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/50"><h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]"><Users className="w-5 h-5 text-[var(--accent)]" /> Employee Performance</h2></div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead><tr className="bg-[var(--glass-bg-strong)] text-[var(--text-muted)] text-sm border-b border-[var(--glass-border)]">
                                            <th className="p-5 font-semibold">Employee</th><th className="p-5 text-center font-semibold">Orders</th><th className="p-5 text-right font-semibold">Revenue</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-[var(--glass-border)] text-[var(--text-primary)]">
                                            {employeeActivity.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-[var(--text-muted)]">No data</td></tr> :
                                                employeeActivity.map((a, i) => (
                                                    <tr key={i} className="hover:bg-[var(--glass-bg-strong)] transition-colors duration-200">
                                                        <td className="p-5 flex items-center gap-3 font-medium">{i === 0 && a.totalSales > 0 && <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-md" />}<span>{a.employeeName}</span></td>
                                                        <td className="p-5 text-center"><span className="bg-[var(--glass-bg)] px-3 py-1 text-sm rounded-full border border-[var(--glass-border)]">{a.totalOrders}</span></td>
                                                        <td className="p-5 text-right font-bold text-[var(--text-primary)]">{formatINR(a.totalSales)}</td>
                                                    </tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>

                            {/* Order Logs */}
                            <GlassCard className="!p-0 overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]"><FileText className="w-5 h-5 text-emerald-500" /> Order Logs</h2>
                                    <div className="flex glass-panel rounded-xl p-1 border border-[var(--glass-border)]">
                                        {['today', '7days', 'monthly'].map(f => (
                                            <button key={f} onClick={() => setDateFilter(f as any)} className={`px-4 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-all duration-300 ${dateFilter === f ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-x-auto max-h-[500px]">
                                    <table className="w-full text-left relative">
                                        <thead className="sticky top-0 bg-[var(--bg-primary)] z-10 shadow-sm"><tr className="bg-[var(--glass-bg-strong)] text-[var(--text-muted)] text-sm border-b border-[var(--glass-border)]">
                                            <th className="p-4 font-semibold">Customer</th><th className="p-4 font-semibold">Items</th><th className="p-4 font-semibold">By</th><th className="p-4 font-semibold">Status</th><th className="p-4 text-right font-semibold">Total</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-[var(--glass-border)] text-[var(--text-primary)]">
                                            {orders.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">No orders</td></tr> :
                                                orders.map(o => (
                                                    <tr key={o._id} className="hover:bg-[var(--glass-bg-strong)] transition-colors duration-200 text-sm">
                                                        <td className="p-4 font-medium">{o.customerName || 'Walk-in'}</td>
                                                        <td className="p-4 text-[var(--text-secondary)] max-w-[200px] truncate">{(o.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}</td>
                                                        <td className="p-4 text-[var(--text-secondary)]">{o.employeeId?.name || '?'}</td>
                                                        <td className="p-4"><span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md ${o.paymentType === 'cash' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'}`}>{o.paymentType}</span></td>
                                                        <td className="p-4 text-right font-bold text-[var(--text-primary)]">{formatINR(o.totalAmount)}</td>
                                                    </tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Sidebar - Employee Management */}
                        <div className="space-y-6">
                            <GlassCard className="flex flex-col relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none"></div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2"><Plus className="text-blue-500" /> Add Employee</h2>
                                <form onSubmit={handleAddEmployee} className="space-y-4 mb-6">
                                    <input required type="text" value={empName} onChange={e => setEmpName(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] transition-colors" placeholder="Name" />
                                    <input required type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] transition-colors" placeholder="Email" />
                                    <input required type="password" value={empPassword} onChange={e => setEmpPassword(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:border-[var(--accent)] transition-colors" placeholder="Password" />
                                    <GlassButton variant="primary" disabled={empLoading} type="submit" className="w-full !rounded-xl !py-3">
                                        {empLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Create Account'}
                                    </GlassButton>
                                </form>
                                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Active Staff</h3>
                                <ul className="space-y-2 flex-1 max-h-[300px] overflow-y-auto pr-1">
                                    {employees.map(emp => (
                                        <li key={emp._id} className="glass-panel border border-[var(--glass-border)] px-4 py-3 rounded-xl flex justify-between items-center group hover:-translate-y-0.5 transition-transform">
                                            <div><p className="text-[var(--text-primary)] text-sm font-semibold">{emp.name}</p><p className="text-[var(--text-muted)] text-[10px] truncate w-28">{emp.email}</p></div>
                                            <button onClick={() => handleDeleteEmployee(emp._id, emp.name)} className="opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white p-2 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        </div>
                    </div>
                </>
            )}

            {/* ========== ANALYTICS TAB ========== */}
            {activeTab === 'analytics' && (
                <div className="space-y-8">
                    {/* AI Insights */}
                    {insights.length > 0 && (
                        <GlassCard className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-2)]/5 border-[var(--accent)]/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[80px] pointer-events-none"></div>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-[var(--text-primary)]"><Brain className="w-6 h-6 text-[var(--accent-2)] drop-shadow-[0_0_8px_rgba(141,91,255,0.5)]" /> AI-Powered Insights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {insights.map((insight, i) => (
                                    <div key={i} className={`glass-panel rounded-2xl p-5 flex items-start gap-4 transition-transform hover:-translate-y-1 ${insight.type === 'danger' ? 'border-red-500/30 bg-red-500/5' : insight.type === 'warning' ? 'border-orange-500/30 bg-orange-500/5' : insight.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
                                        <span className="text-3xl drop-shadow-sm">{insight.icon}</span>
                                        <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">{insight.text}</p>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Sales Trend Chart */}
                    <GlassCard>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]"><TrendingUp className="w-6 h-6 text-emerald-500" /> Sales Trend</h2>
                            <div className="flex glass-panel rounded-lg p-1 border border-[var(--glass-border)]">
                                {['daily', 'weekly', 'monthly'].map(p => (
                                    <button key={p} onClick={() => setTrendPeriod(p as any)} className={`px-4 py-1.5 text-xs font-bold rounded-md uppercase transition-all duration-300 ${trendPeriod === p ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>{p}</button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[340px]">
                            {salesTrend.length === 0 ? <div className="h-full flex items-center justify-center text-[var(--text-muted)] font-medium">No trend data yet</div> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesTrend}>
                                        <defs>
                                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" stroke="var(--glass-border)" vertical={false} />
                                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--glass-border)', strokeWidth: 2 }} />
                                        <Area type="monotone" dataKey="totalSales" name="Sales" stroke="#10b981" strokeWidth={3} fill="url(#salesGradient)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </GlassCard>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Best Sellers */}
                        <GlassCard>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-8 text-[var(--text-primary)]"><Trophy className="w-5 h-5 text-yellow-500" /> Best Selling Dishes</h2>
                            <div className="h-[300px]">
                                {bestSellers.length === 0 ? <div className="h-full flex items-center justify-center text-[var(--text-muted)]">No data</div> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={bestSellers.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="var(--glass-border)" horizontal={false} />
                                            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass-bg)' }} />
                                            <Bar dataKey="totalQuantity" name="Qty Sold" radius={[0, 8, 8, 0]} barSize={24}>
                                                {bestSellers.slice(0, 5).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </GlassCard>

                        {/* Peak Hours */}
                        <GlassCard>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-8 text-[var(--text-primary)]"><Clock className="w-5 h-5 text-orange-500" /> Peak Business Hours</h2>
                            <div className="h-[300px]">
                                {peakHours.length === 0 ? <div className="h-full flex items-center justify-center text-[var(--text-muted)]">No data</div> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={peakHours.map((p: any) => ({ ...p, label: `${p.hour % 12 || 12}${p.hour >= 12 ? 'PM' : 'AM'}` }))} margin={{ top: 10 }}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="var(--glass-border)" vertical={false} />
                                            <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass-bg)' }} />
                                            <Bar dataKey="orderCount" name="Orders" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>

            )}

            {/* ========== INVENTORY TAB ========== */}
            {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        {/* Low Stock Alerts */}
                        {lowStockAlerts.length > 0 && (
                            <GlassCard className="bg-[var(--danger)]/5 border-[var(--danger)]/20 !p-5">
                                <h3 className="text-lg font-bold text-[var(--danger)] flex items-center gap-2 mb-4"><AlertCircle className="w-5 h-5" /> Low Stock Alerts</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {lowStockAlerts.map((a, i) => (
                                        <div key={i} className="glass-panel border-[var(--danger)]/10 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                                            <span className="text-[var(--text-primary)] font-medium text-sm">{a.itemName}</span>
                                            <span className="text-[var(--danger)] text-sm font-black bg-[var(--danger)]/10 px-2.5 py-1 rounded-md">{a.quantity} {a.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* Inventory Table */}
                        <GlassCard className="!p-0 overflow-hidden">
                            <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/50"><h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]"><Package className="w-5 h-5 text-emerald-500" /> Stock Ledger</h2></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead><tr className="bg-[var(--glass-bg-strong)] text-[var(--text-muted)] text-sm border-b border-[var(--glass-border)]">
                                        <th className="p-5 font-semibold">Item</th><th className="p-5 text-center font-semibold">Quantity</th><th className="p-5 text-center font-semibold">Unit</th><th className="p-5 text-center font-semibold">Threshold</th><th className="p-5 text-center font-semibold">Status</th><th className="p-5"></th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-[var(--glass-border)] text-[var(--text-primary)]">
                                        {inventory.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">No inventory items</td></tr> :
                                            inventory.map(item => {
                                                const isLow = item.quantity <= item.lowStockThreshold;
                                                return (
                                                    <tr key={item._id} className="hover:bg-[var(--glass-bg-strong)] transition-colors duration-200">
                                                        <td className="p-5 font-medium">{item.itemName}</td>
                                                        <td className={`p-5 text-center font-bold ${isLow ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>{item.quantity}</td>
                                                        <td className="p-5 text-center text-[var(--text-secondary)]">{item.unit}</td>
                                                        <td className="p-5 text-center text-[var(--text-secondary)]">{item.lowStockThreshold}</td>
                                                        <td className="p-5 text-center">
                                                            <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md ${isLow ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>{isLow ? 'LOW' : 'OK'}</span>
                                                        </td>
                                                        <td className="p-5 text-right">
                                                            <button onClick={() => handleDeleteInventory(item._id)} className="text-[var(--danger)] hover:bg-[var(--danger)]/10 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Add Inventory */}
                    <div>
                        <GlassCard className="sticky top-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-primary)]"><Plus className="text-emerald-500" /> Add Stock Item</h2>
                            <form onSubmit={handleAddInventory} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block uppercase tracking-wide">Item Name</label>
                                    <input required type="text" value={invName} onChange={e => setInvName(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:border-emerald-500 transition-colors" placeholder="e.g. Coffee Beans" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block uppercase tracking-wide">Quantity</label>
                                        <input required type="number" min="0" value={invQty} onChange={e => setInvQty(Number(e.target.value))} className="w-full glass-input rounded-xl px-4 py-3 text-sm transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block uppercase tracking-wide">Unit</label>
                                        <select value={invUnit} onChange={e => setInvUnit(e.target.value)} className="w-full glass-input rounded-xl px-4 py-3 text-sm transition-colors cursor-pointer appearance-none">
                                            {['pcs', 'kg', 'litre', 'grams', 'dozen', 'units'].map(u => <option key={u} value={u} className="bg-[var(--bg-primary)]">{u}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block uppercase tracking-wide">Low Stock Alert Below</label>
                                    <input type="number" min="1" value={invThreshold} onChange={e => setInvThreshold(Number(e.target.value))} className="w-full glass-input rounded-xl px-4 py-3 text-sm transition-colors" />
                                </div>
                                <GlassButton variant="primary" disabled={invLoading} type="submit" className="w-full !rounded-xl !py-3 mt-2 !bg-[length:200%_200%] !bg-[linear-gradient(135deg,#10b981,#34d399)] shadow-[0_12px_30px_rgba(16,185,129,0.25)]">
                                    {invLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Add to Ledger'}
                                </GlassButton>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* ========== STAFFING TAB ========== */}
            {activeTab === 'staffing' && (
                <div className="space-y-8">
                    {/* Attendance Records */}
                    <GlassCard className="!p-0 overflow-hidden">
                        <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/50"><h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]"><Clock className="w-5 h-5 text-blue-500" /> Attendance Records (Last 7 Days)</h2></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr className="bg-[var(--glass-bg-strong)] text-[var(--text-muted)] text-sm border-b border-[var(--glass-border)]">
                                    <th className="p-5 font-semibold">Employee</th><th className="p-5 font-semibold">Date</th><th className="p-5 text-center font-semibold">Check In</th><th className="p-5 text-center font-semibold">Check Out</th><th className="p-5 text-right font-semibold">Total Hours</th>
                                </tr></thead>
                                <tbody className="divide-y divide-[var(--glass-border)] text-[var(--text-primary)]">
                                    {attendance.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">No attendance records</td></tr> :
                                        attendance.map((r, i) => (
                                            <tr key={i} className="hover:bg-[var(--glass-bg-strong)] transition-colors duration-200">
                                                <td className="p-5 font-medium">{r.employeeId?.name || 'Unknown'}</td>
                                                <td className="p-5 text-[var(--text-secondary)]">{r.date}</td>
                                                <td className="p-5 text-center text-emerald-500 font-medium">{r.checkInTime ? format(new Date(r.checkInTime), 'h:mm a') : '-'}</td>
                                                <td className="p-5 text-center text-orange-500 font-medium">{r.checkOutTime ? format(new Date(r.checkOutTime), 'h:mm a') : 'Active'}</td>
                                                <td className="p-5 text-right font-bold text-[var(--text-primary)]">{r.totalHours ? `${r.totalHours}h` : '-'}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            )}
        </AnimatedPage>
    );
}
