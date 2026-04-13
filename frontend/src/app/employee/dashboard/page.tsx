"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { CreditCard, Banknote, Plus, RefreshCw, FileText, Loader2, AlertCircle, Trash2, Clock, LogIn, LogOut, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Toaster, toast } from 'react-hot-toast';
import { clearSession, getStoredToken } from '@/lib/auth';
import { formatINR } from '@/utils/currency';

import AnimatedPage from '@/components/AnimatedPage';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';
import ThemeToggle from '@/components/ThemeToggle';

interface OrderItem { name: string; variant: string; quantity: number; price: number; }
interface Order { _id: string; orderNumber: string; totalAmount: number; paymentType: 'cash' | 'online'; paymentStatus: 'paid' | 'pending'; orderType: string; createdAt: string; }
interface Summary { totalSales: number; totalCash: number; totalOnline: number; }

export default function EmployeeDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [summary, setSummary] = useState<Summary>({ totalSales: 0, totalCash: 0, totalOnline: 0 });
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [receiptLoading, setReceiptLoading] = useState<string | null>(null);

    // Attendance
    const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
    const [items, setItems] = useState<OrderItem[]>([{ name: '', variant: 'full', quantity: 1, price: 0 }]);
    const [paymentType, setPaymentType] = useState<'cash' | 'online'>('cash');

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, ordersRes, attendRes] = await Promise.all([
                api.get('/orders/summary'),
                api.get('/orders/today'),
                api.get('/attendance/my-status')
            ]);
            setSummary(summaryRes.data.data);
            setOrders(ordersRes.data.data);
            setAttendanceStatus(attendRes.data.data);
        } catch (err: any) {
            toast.error('Failed to load data');
        } finally { setLoading(false); }
    };

    const silentFetchData = async () => {
        try {
            const [summaryRes, ordersRes] = await Promise.all([
                api.get('/orders/summary'),
                api.get('/orders/today')
            ]);
            setSummary(summaryRes.data.data);
            setOrders(ordersRes.data.data);
        } catch (err) { }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') silentFetchData();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const validItems = items.filter(i => i.name.trim() && i.quantity > 0 && i.price > 0);
        if (validItems.length === 0) return toast.error('Please add at least one valid item');
        setOrderLoading(true);
        try {
            await api.post('/orders', { 
                customerName: customerName || 'Walk-in', customerPhone, tableNumber, orderType, 
                items: validItems, totalAmount, paymentType, paymentStatus: 'pending' 
            });
            toast.success('Order requested!', { icon: '✨' });
            setCustomerName(''); setCustomerPhone(''); setTableNumber('');
            setItems([{ name: '', variant: 'full', quantity: 1, price: 0 }]);
            setPaymentType('cash');
            silentFetchData();
        } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setOrderLoading(false); }
    };

    const handleMarkPaid = async (orderId: string) => {
        try {
            await api.patch(`/orders/${orderId}/pay`);
            toast.success('Order marked as paid');
            silentFetchData();
        } catch (err: any) {
            toast.error('Failed to update status');
        }
    };

    const downloadBlob = async (endpoint: string, fallbackName: string) => {
        const response = await api.get(endpoint, { responseType: 'blob' });
        const disposition = response.headers['content-disposition'];
        let filename = fallbackName;
        if (disposition && disposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleGenerateInvoice = async (orderId: string) => {
        setReceiptLoading(`inv-${orderId}`);
        try {
            await downloadBlob(`/reports/invoice/${orderId}`, `invoice-${orderId}.pdf`);
            toast.success('Invoice exported!', { icon: '📄' });
        } catch (err: any) { toast.error('Failed to generate invoice'); }
        finally { setReceiptLoading(null); }
    };

    const handleGenerateKOT = async (orderId: string) => {
        setReceiptLoading(`kot-${orderId}`);
        try {
            await downloadBlob(`/reports/slip/${orderId}`, `kot-${orderId}.pdf`);
            toast.success('KOT generated!', { icon: '🎫' });
        } catch (err: any) { toast.error('Failed to generate KOT slip'); }
        finally { setReceiptLoading(null); }
    };

    const handleCheckIn = async () => {
        setAttendanceLoading(true);
        try {
            await api.post('/attendance/check-in');
            toast.success('Checked in successfully!');
            const res = await api.get('/attendance/my-status');
            setAttendanceStatus(res.data.data);
        } catch (err: any) { toast.error(err.response?.data?.error || 'Check-in failed'); }
        finally { setAttendanceLoading(false); }
    };

    const handleCheckOut = async () => {
        setAttendanceLoading(true);
        try {
            await api.post('/attendance/check-out');
            toast.success('Checked out! Good job today!');
            const res = await api.get('/attendance/my-status');
            setAttendanceStatus(res.data.data);
        } catch (err: any) { toast.error(err.response?.data?.error || 'Check-out failed'); }
        finally { setAttendanceLoading(false); }
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const isCheckedIn = attendanceStatus?.checkInTime && !attendanceStatus?.checkOutTime;
    const isCheckedOut = attendanceStatus?.checkOutTime;

    return (
        <AnimatedPage>
            <Toaster position="top-center" toastOptions={{ className: 'glass-panel text-[var(--text-primary)] border border-[var(--glass-border)]' }} />

            <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">POS Terminal</h1>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">Manage orders & clock attendance</p>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <GlassButton variant="ghost" onClick={fetchData} className="!py-2 !px-3 font-bold text-sm" disabled={loading}>
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </GlassButton>
                    <GlassButton variant="ghost" onClick={() => { clearSession(); window.location.href = '/'; }} className="text-[var(--danger)] !py-2 !px-4 text-sm">
                        Logout
                    </GlassButton>
                </div>
            </header>

            {/* Attendance Clock */}
            <GlassCard hover={false} className="mb-8 border border-[var(--glass-border)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="flex items-center gap-4 z-10">
                    <div className="p-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl shadow-sm"><Clock className="w-7 h-7 text-[var(--accent)] drop-shadow-md" /></div>
                    <div>
                        <p className="text-[var(--text-primary)] font-bold text-lg">Shift Clock</p>
                        <p className="text-[var(--text-secondary)] text-sm font-medium">
                            {isCheckedOut ? `Shift Complete — ${attendanceStatus.totalHours}h logged` :
                                isCheckedIn ? `Active since ${format(new Date(attendanceStatus.checkInTime), 'h:mm a')}` :
                                    'Not clocked in yet today'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 z-10 w-full sm:w-auto mt-4 sm:mt-0">
                    {!isCheckedIn && !isCheckedOut && (
                        <GlassButton variant="primary" onClick={handleCheckIn} disabled={attendanceLoading} className="flex-1 sm:flex-none justify-center gap-2 !px-6 bg-[linear-gradient(135deg,#10b981,#34d399)] shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                            {attendanceLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><LogIn className="w-5 h-5" /> Clock In</>}
                        </GlassButton>
                    )}
                    {isCheckedIn && !isCheckedOut && (
                        <GlassButton variant="primary" onClick={handleCheckOut} disabled={attendanceLoading} className="flex-1 sm:flex-none justify-center gap-2 !px-6 bg-[linear-gradient(135deg,#f97316,#fb923c)] shadow-[0_10px_30px_rgba(249,115,22,0.3)]">
                            {attendanceLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><LogOut className="w-5 h-5" /> Clock Out</>}
                        </GlassButton>
                    )}
                    {isCheckedOut && (
                        <span className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 glass-panel text-emerald-500 border border-emerald-500/20 rounded-2xl text-sm font-bold shadow-sm">✓ Day Complete</span>
                    )}
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Earnings (Today)', value: formatINR(summary.totalSales), color: 'text-emerald-500' },
                            { label: 'Cash Collected', value: formatINR(summary.totalCash), color: 'text-emerald-500' },
                            { label: 'Online Payments', value: formatINR(summary.totalOnline), color: 'text-[var(--accent)]' },
                            { label: 'Orders Count', value: orders.length, color: 'text-orange-500' },
                        ].map((s, i) => (
                            <GlassCard key={i} className="p-5 flex flex-col justify-center gap-1 group transition-transform hover:scale-105">
                                <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">{s.label}</p>
                                <h3 className={`text-2xl font-black ${s.color} drop-shadow-sm`}>{s.value}</h3>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Transactions */}
                    <GlassCard className="!p-0 overflow-hidden flex flex-col items-stretch">
                        <div className="p-6 border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)]/50"><h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]"><FileText className="w-5 h-5 text-[var(--accent)]" /> Today's Transactions</h2></div>
                        <div>
                            {orders.length === 0 ? (
                                <div className="p-12 text-center text-[var(--text-muted)] font-medium">No orders yet today.</div>
                            ) : (
                                <ul className="divide-y divide-[var(--glass-border)]">
                                    {orders.map((order) => (
                                        <li key={order._id} className="p-5 hover:bg-[var(--glass-bg)] transition-colors duration-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                                    {order.paymentType === 'cash' ? <Banknote className="w-7 h-7" /> : <CreditCard className="w-7 h-7" />}
                                                </div>
                                                <div>
                                                    <p className="text-[var(--text-primary)] font-bold text-lg">{formatINR(order.totalAmount)}</p>
                                                    <p className="text-[var(--text-secondary)] text-sm font-medium mt-0.5">{format(new Date(order.createdAt), 'h:mm a')} • {order.orderNumber} • <span className="uppercase tracking-wide text-xs font-bold">{order.paymentStatus}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                {order.paymentStatus === 'pending' && (
                                                    <GlassButton variant="primary" onClick={() => handleMarkPaid(order._id)} className="!py-2 !px-4 text-xs font-bold !bg-emerald-500 text-white shadow-sm border-transparent">
                                                        Mark Paid
                                                    </GlassButton>
                                                )}
                                                <GlassButton variant="secondary" onClick={() => handleGenerateKOT(order._id)} className="!py-2 !px-3 !rounded-lg text-xs font-bold">
                                                    {receiptLoading === `kot-${order._id}` ? <Loader2 className="animate-spin w-4 h-4" /> : 'Slip'}
                                                </GlassButton>
                                                <GlassButton variant="secondary" onClick={() => handleGenerateInvoice(order._id)} disabled={order.paymentStatus === 'pending'} className={`!py-2 !px-3 !rounded-lg text-xs font-bold ${order.paymentStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {receiptLoading === `inv-${order._id}` ? <Loader2 className="animate-spin w-4 h-4" /> : 'Invoice'}
                                                </GlassButton>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* New Order Form */}
                <div className="lg:col-span-1">
                    <GlassCard className="sticky top-6 relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[var(--text-primary)]"><Plus className="w-6 h-6 text-emerald-500 drop-shadow-sm" /> New POS Order</h2>
                        <form onSubmit={handleCreateOrder} className="space-y-6 relative z-10">
                            <div>
                                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2 uppercase tracking-wider">Customer Name (Optional)</label>
                                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full glass-input rounded-xl py-3 px-4 outline-none text-sm transition-colors focus:border-emerald-500" placeholder="Walk-in" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2 uppercase tracking-wider">Phone</label>
                                    <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full glass-input rounded-xl py-3 px-4 outline-none text-sm transition-colors focus:border-emerald-500" placeholder="+91..." />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2 uppercase tracking-wider">Order Type</label>
                                    <select value={orderType} onChange={(e) => setOrderType(e.target.value as any)} className="w-full glass-input rounded-xl py-3 px-4 outline-none text-sm transition-colors appearance-none cursor-pointer focus:border-emerald-500">
                                        <option value="dine-in" className="bg-[var(--bg-primary)]">Dine In</option>
                                        <option value="takeaway" className="bg-[var(--bg-primary)]">Takeaway</option>
                                    </select>
                                </div>
                            </div>
                            
                            {orderType === 'dine-in' && (
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2 uppercase tracking-wider">Table Info (Optional)</label>
                                    <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full glass-input rounded-xl py-3 px-4 outline-none text-sm transition-colors focus:border-emerald-500" placeholder="e.g. T4" />
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-[var(--glass-border)] pb-2">
                                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dishes</span>
                                    <button type="button" onClick={() => setItems([...items, { name: '', variant: 'full', quantity: 1, price: 0 }])} className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md hover:bg-emerald-500/20 transition-colors">+ ADD ROW</button>
                                </div>
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-start glass-panel p-3 rounded-xl shadow-sm border border-[var(--glass-border)] transition-transform hover:-translate-y-0.5">
                                        <div className="flex-1 space-y-3">
                                            <input type="text" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} placeholder="Dish Name" className="w-full glass-input px-3 py-2.5 rounded-lg text-sm text-[var(--text-primary)] border-none bg-black/5 dark:bg-white/5" />
                                            <div className="flex justify-between gap-3">
                                                <select value={item.variant} onChange={(e) => updateItem(idx, 'variant', e.target.value)} className="w-24 glass-input px-3 py-2.5 rounded-lg text-sm text-[var(--text-primary)] border-none bg-black/5 dark:bg-white/5 appearance-none">
                                                    <option value="full" className="bg-[var(--bg-primary)]">Full</option>
                                                    <option value="half" className="bg-[var(--bg-primary)]">Half</option>
                                                    <option value="custom" className="bg-[var(--bg-primary)]">-</option>
                                                </select>
                                                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))} className="w-20 glass-input px-3 py-2.5 rounded-lg text-sm text-[var(--text-primary)] border-none bg-black/5 dark:bg-white/5 font-semibold text-center" />
                                            </div>
                                            <div className="relative w-full">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium">₹</span>
                                                <input type="number" min="0" value={item.price} onChange={(e) => updateItem(idx, 'price', Number(e.target.value))} className="w-full glass-input pl-8 pr-3 py-2.5 rounded-lg text-sm text-[var(--text-primary)] border-none bg-black/5 dark:bg-white/5 font-semibold" />
                                            </div>
                                        </div>
                                        {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-500 p-2.5 hover:bg-red-500/10 rounded-lg transition-colors mt-12"><Trash2 className="w-4 h-4" /></button>}
                                    </div>
                                ))}
                            </div>

                            <div className="glass-panel p-5 border border-[var(--glass-border)] rounded-2xl flex justify-between items-center shadow-inner">
                                <span className="font-semibold text-[var(--text-secondary)] uppercase tracking-widest text-sm">Total Due</span>
                                <span className="text-3xl font-black text-[var(--text-primary)] drop-shadow-md">{formatINR(totalAmount)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button type="button" onClick={() => setPaymentType('cash')} className={`py-4 rounded-xl border-2 transition-all duration-300 text-sm font-bold flex flex-col items-center gap-1 ${paymentType === 'cash' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'glass-panel border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                                    <Banknote className="w-5 h-5 mb-1" />
                                    Cash Match
                                </button>
                                <button type="button" onClick={() => setPaymentType('online')} className={`py-4 rounded-xl border-2 transition-all duration-300 text-sm font-bold flex flex-col items-center gap-1 ${paymentType === 'online' ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_15px_rgba(79,121,255,0.2)]' : 'glass-panel border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                                    <CreditCard className="w-5 h-5 mb-1" />
                                    UPI/Card
                                </button>
                            </div>

                            <GlassButton type="submit" disabled={orderLoading} variant="primary" className="w-full !rounded-2xl !py-5 shadow-[0_12px_40px_rgba(16,185,129,0.3)] !bg-[length:200%_200%] !bg-[linear-gradient(135deg,#10b981,#059669)] font-black text-lg mt-6">
                                {orderLoading ? <Loader2 className="animate-spin w-7 h-7 mx-auto" /> : 'Confirm & Charge'}
                            </GlassButton>
                        </form>
                    </GlassCard>
                </div>
            </div>
        </AnimatedPage>
    );
}
