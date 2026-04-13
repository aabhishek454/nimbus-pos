"use client";

import React, { useEffect, useState, useMemo } from 'react';
import api from '@/lib/axios';
import { CreditCard, Banknote, RefreshCw, FileText, Loader2, Trash2, Clock, LogIn, LogOut, X, Search, ShoppingBag, History } from 'lucide-react';
import { format } from 'date-fns';
import { Toaster, toast } from 'react-hot-toast';
import { clearSession } from '@/lib/auth';
import { formatINR } from '@/utils/currency';
import { haptics } from '@/utils/haptics';

import AnimatedPage from '@/components/AnimatedPage';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';
import ThemeToggle from '@/components/ThemeToggle';
import POSItemCard from '@/components/POSItemCard';
import FloatingCart from '@/components/FloatingCart';
import SkeletonLoader from '@/components/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem { name: string; variant: string; quantity: number; price: number; }
interface Order { _id: string; orderNumber: string; totalAmount: number; paymentType: 'cash' | 'online'; paymentStatus: 'paid' | 'pending'; orderType: string; createdAt: string; }
interface Summary { totalSales: number; totalCash: number; totalOnline: number; }

export default function EmployeeDashboard() {
    const [view, setView] = useState<'pos' | 'orders'>('pos');
    const [orders, setOrders] = useState<Order[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalSales: 0, totalCash: 0, totalOnline: 0 });
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [receiptLoading, setReceiptLoading] = useState<string | null>(null);

    // Attendance
    const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // POS State (Zero Lag)
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [menuCatalog, setMenuCatalog] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentType, setPaymentType] = useState<'cash' | 'online'>('cash');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');

    const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + (item.quantity * item.price), 0), [cart]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, ordersRes, attendRes, menuRes] = await Promise.all([
                api.get('/orders/summary'),
                api.get('/orders/today'),
                api.get('/attendance/my-status'),
                api.get('/menu')
            ]);
            setSummary(summaryRes.data.data);
            setOrders(ordersRes.data.data);
            setAttendanceStatus(attendRes.data.data);
            setMenuCatalog(menuRes.data.data);
        } catch (err: any) {
            toast.error('Failed to load data');
        } finally { setLoading(false); }
    };

    const silentFetchData = async () => {
        try {
            const [summaryRes, ordersRes, menuRes] = await Promise.all([
                api.get('/orders/summary'),
                api.get('/orders/today'),
                api.get('/menu')
            ]);
            setSummary(summaryRes.data.data);
            setOrders(ordersRes.data.data);
            setMenuCatalog(menuRes.data.data);
        } catch (err) { }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') silentFetchData();
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (existing) {
                return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { name: item.name, variant: item.variants?.[0]?.type || 'full', quantity: 1, price: item.variants?.[0]?.price || 0 }];
        });
    };

    const removeFromCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.name !== item.name);
        });
    };

    const handleCreateOrder = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');
        setOrderLoading(true);
        try {
            await api.post('/orders', { 
                customerName: customerName || 'Walk-in', customerPhone, tableNumber, orderType, 
                items: cart, totalAmount, paymentType, paymentStatus: 'pending' 
            });
            haptics.success();
            toast.success('Order placed!', { icon: '✨' });
            setCart([]);
            setCustomerName(''); setCustomerPhone(''); setTableNumber('');
            silentFetchData();
        } catch (err: any) { 
            haptics.error();
            toast.error(err.response?.data?.error || 'Failed'); 
        } finally { setOrderLoading(false); }
    };

    const handleMarkPaid = async (orderId: string) => {
        try {
            await api.patch(`/orders/${orderId}/pay`);
            haptics.success();
            toast.success('Paid', { icon: '💰' });
            silentFetchData();
        } catch (err: any) { toast.error('Payment failed'); }
    };

    const handleCheckIn = async () => {
        setAttendanceLoading(true);
        try {
            await api.post('/attendance/check-in');
            haptics.success();
            toast.success('Checked in!');
            silentFetchData();
        } catch (err: any) { toast.error('Failed'); }
        finally { setAttendanceLoading(false); }
    };

    const filteredMenu = useMemo(() => {
        return menuCatalog.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [menuCatalog, searchQuery]);

    const isCheckedIn = attendanceStatus?.checkInTime && !attendanceStatus?.checkOutTime;

    if (loading) {
        return (
            <AnimatedPage className="space-y-10">
                <header className="flex items-center justify-between">
                    <SkeletonLoader className="h-12 w-48" />
                    <SkeletonLoader className="h-12 w-32" />
                </header>
                <div className="space-y-6">
                    <SkeletonLoader className="h-24 w-full" />
                    <SkeletonLoader className="h-16 w-full" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <SkeletonLoader className="h-40 w-full" count={4} />
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <Toaster position="top-right" toastOptions={{ className: 'glass-panel text-white border-white/10' }} />

            {/* Header */}
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black gradient-text">Nimbus POS</h1>
                    <p className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-widest">{view === 'pos' ? 'Terminal' : 'Operations'}</p>
                </div>
                <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--glass-border)] shadow-inner">
                    <button 
                        onClick={() => { haptics.light(); setView('pos'); }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'pos' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}
                    >
                        Terminal
                    </button>
                    <button 
                        onClick={() => { haptics.light(); setView('orders'); }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'orders' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}
                    >
                        History
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {view === 'pos' ? (
                    <motion.div
                        key="pos"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Attendance Strip */}
                        {!isCheckedIn && (
                            <GlassCard className="!p-4 border-l-4 border-l-orange-500 bg-orange-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    <p className="text-sm font-bold">You are not clocked in for this shift.</p>
                                </div>
                                <GlassButton variant="secondary" onClick={handleCheckIn} disabled={attendanceLoading} className="!py-1.5 !px-4 !text-xs !bg-orange-500/10 !border-orange-500/20 text-orange-500">
                                    {attendanceLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Clock In Now'}
                                </GlassButton>
                            </GlassCard>
                        )}

                        {/* Search Bar */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
                            </div>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search menu, categories, or tags..."
                                className="w-full glass-input pl-12 pr-6 py-4 rounded-[24px] text-base font-medium shadow-2xl focus:shadow-[var(--primary)]/10"
                            />
                        </div>

                        {/* POS Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredMenu.map((item) => (
                                <POSItemCard 
                                    key={item._id}
                                    item={item}
                                    onAdd={() => addToCart(item)}
                                    onRemove={() => removeFromCart(item)}
                                    quantity={cart.find(i => i.name === item.name)?.quantity || 0}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="orders"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Revenue', value: formatINR(summary.totalSales), icon: Banknote },
                                { label: 'Cash', value: formatINR(summary.totalCash), icon: Banknote },
                                { label: 'Online', value: formatINR(summary.totalOnline), icon: CreditCard },
                                { label: 'Count', value: orders.length, icon: ShoppingBag },
                            ].map((s, i) => (
                                <GlassCard key={i} className="!p-4 flex items-center gap-4">
                                    <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
                                        <s.icon className="w-5 h-5 text-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-muted)] text-[9px] uppercase tracking-widest font-black">{s.label}</p>
                                        <p className="text-lg font-black text-white">{s.value}</p>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Order List */}
                        <GlassCard className="!p-0 overflow-hidden">
                            <ul className="divide-y divide-[var(--glass-border)]">
                                {orders.length === 0 ? (
                                    <li className="p-10 text-center text-[var(--text-muted)]">No transactions found for today.</li>
                                ) : (
                                    orders.map((order) => (
                                        <li key={order._id} className="p-5 flex items-center justify-between hover:bg-[var(--glass-bg)] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    {order.paymentType === 'cash' ? <Banknote className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white">{formatINR(order.totalAmount)}</p>
                                                    <p className="text-xs text-[var(--text-muted)] font-bold">{order.orderNumber} • {format(new Date(order.createdAt), 'h:mm a')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {order.paymentStatus === 'pending' && (
                                                    <GlassButton variant="secondary" onClick={() => handleMarkPaid(order._id)} className="!py-1.5 !px-3 font-black text-[10px] uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                        Mark Paid
                                                    </GlassButton>
                                                )}
                                                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter ${order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    {order.paymentStatus}
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            <FloatingCart 
                items={cart}
                onPlaceOrder={handleCreateOrder}
                onClear={() => setCart([])}
            />

            {orderLoading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)]" />
                        <p className="text-white font-black uppercase tracking-widest text-sm">Processing Receipt...</p>
                    </div>
                </div>
            )}
        </AnimatedPage>
    );
}
