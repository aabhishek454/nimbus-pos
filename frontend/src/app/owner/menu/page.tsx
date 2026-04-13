"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { UtensilsCrossed, Plus, Trash2, Edit2, Loader2, Save, X, Search, Upload, FileText } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import AnimatedPage from '@/components/AnimatedPage';
import GlassCard from '@/components/GlassCard';
import GlassButton from '@/components/GlassButton';

export default function MenuManager() {
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('General');
    const [variants, setVariants] = useState<{ type: string; price: number }[]>([{ type: 'full', price: 0 }]);
    const [formLoading, setFormLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await api.get('/menu');
            setMenu(res.data.data);
        } catch (error) {
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validVariants = variants.filter(v => v.type.trim() && v.price >= 0);
        if (validVariants.length === 0) return toast.error('Add at least one valid variant price');
        if (!name.trim()) return toast.error('Menu name required');

        setFormLoading(true);
        try {
            const payload = { name, category, variants: validVariants };
            if (isEditing && currentId) {
                await api.put(`/menu/${currentId}`, payload);
                toast.success('Item updated');
            } else {
                await api.post('/menu', payload);
                toast.success('Item added');
            }
            resetForm();
            fetchMenu();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to save');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string, itemName: string) => {
        if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;
        try {
            await api.delete(`/menu/${id}`);
            toast.success('Item deleted');
            fetchMenu();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const startEdit = (item: any) => {
        setIsEditing(true);
        setCurrentId(item._id);
        setName(item.name);
        setCategory(item.category || 'General');
        setVariants(item.variants?.length ? [...item.variants] : [{ type: 'full', price: 0 }]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setName('');
        setCategory('General');
        setVariants([{ type: 'full', price: 0 }]);
    };

    const addVariant = () => setVariants([...variants, { type: 'half', price: 0 }]);
    const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            return toast.error('Please upload a valid CSV file');
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadLoading(true);
        try {
            const res = await api.post('/menu/upload-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(res.data.message || 'Menu uploaded successfully');
            fetchMenu();
            // Reset input
            e.target.value = '';
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to upload CSV');
        } finally {
            setUploadLoading(false);
        }
    };

    const downloadSampleCSV = () => {
        const headers = 'Name,Category,Variant,Price\n';
        const sample1 = 'Chicken Momo,Snacks,Half,60\n';
        const sample2 = 'Chicken Momo,Snacks,Full,120\n';
        const sample3 = 'Veg Chowmein,Main Course,Full,100\n';
        
        const blob = new Blob([headers + sample1 + sample2 + sample3], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'menu_template.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredMenu = menu.filter(item => item.name.toLowerCase().includes(search.toLowerCase()) || 
                                              (item.category && item.category.toLowerCase().includes(search.toLowerCase())));

    return (
        <AnimatedPage>
            <Toaster position="top-center" toastOptions={{ className: 'glass-panel text-[var(--text-primary)] border border-[var(--glass-border)]' }} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header layout */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
                            <UtensilsCrossed className="w-8 h-8 text-[var(--primary)]" /> Menu Management
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1 tracking-wide">Configure dishes, variants, and dynamic pricing natively.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <GlassButton variant="secondary" onClick={downloadSampleCSV} className="flex items-center gap-2 !py-2 !px-4 text-xs font-bold">
                            <FileText className="w-4 h-4" /> Template
                        </GlassButton>
                        <div className="relative">
                            <input 
                                type="file" 
                                id="csvUpload" 
                                accept=".csv" 
                                onChange={handleCSVUpload} 
                                className="hidden" 
                            />
                            <label htmlFor="csvUpload">
                                <GlassButton as="div" variant="primary" className="flex items-center gap-2 !py-2 !px-4 text-xs font-bold cursor-pointer !bg-[var(--primary)] text-white border-transparent">
                                    {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    Bulk Import
                                </GlassButton>
                            </label>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left/Top side: Form Editor */}
                    <GlassCard className="lg:col-span-1 sticky top-24 bg-[var(--bg-primary)] border-[var(--primary)]/20 shadow-xl overflow-visible">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                                {isEditing ? <Edit2 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-emerald-500" />}
                                {isEditing ? 'Edit Dish' : 'Add New Dish'}
                            </h2>
                            {isEditing && (
                                <button onClick={resetForm} className="text-[var(--text-muted)] hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
                            )}
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2 uppercase tracking-wider">Dish Name</label>
                                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full glass-input rounded-xl py-2.5 px-4 outline-none text-sm transition-colors focus:border-[var(--primary)]" placeholder="e.g. Chicken Momo" />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-2 uppercase tracking-wider">Category</label>
                                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full glass-input rounded-xl py-2.5 px-4 outline-none text-sm transition-colors focus:border-[var(--primary)]" placeholder="e.g. Starters" />
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Variants & Pricing</label>
                                    <button type="button" onClick={addVariant} className="text-[var(--primary)] text-xs font-bold flex items-center gap-1 hover:opacity-80"><Plus className="w-3 h-3" /> Variant</button>
                                </div>
                                
                                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                                    {variants.map((v, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input type="text" value={v.type} onChange={(e) => updateVariant(idx, 'type', e.target.value)} placeholder="Type (e.g. half)" className="w-1/2 glass-input px-3 py-2 rounded-lg text-sm border-none bg-[var(--glass-bg)]" />
                                            <div className="relative w-1/2 flex items-center">
                                                <span className="absolute left-3 text-[var(--text-muted)] text-sm">₹</span>
                                                <input type="number" min="0" value={v.price} onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))} className="w-full glass-input pl-7 pr-3 py-2 rounded-lg text-sm border-none bg-[var(--glass-bg)]" />
                                            </div>
                                            {variants.length > 1 && (
                                                <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-md"><X className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <GlassButton type="submit" variant="primary" disabled={formLoading} className={`w-full !py-3 mt-4 font-bold ${isEditing ? '!bg-blue-600 text-white shadow-lg border-transparent' : '!bg-[var(--primary)] text-white shadow-lg border-transparent'}`}>
                                {formLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : (
                                    <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {isEditing ? 'Save Changes' : 'Create Menu Item'}</span>
                                )}
                            </GlassButton>
                        </form>
                    </GlassCard>

                    {/* Right/Bottom side: Data View */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                            <input 
                                type="text" 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                placeholder="Search menu..." 
                                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm bg-[var(--bg-primary)] shadow-sm"
                            />
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>
                        ) : filteredMenu.length === 0 ? (
                            <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-2 border-[var(--glass-border)] text-[var(--text-secondary)]">
                                No menu items found. Start building your menu!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredMenu.map(item => (
                                    <GlassCard key={item._id} className="p-5 flex flex-col justify-between hover:border-[var(--primary)]/50 transition-colors group">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-[var(--text-primary)]">{item.name}</h3>
                                                <span className="text-[10px] uppercase tracking-wider bg-[var(--glass-bg-strong)] px-2 py-1 rounded-full text-[var(--text-secondary)] font-bold">{item.category || 'General'}</span>
                                            </div>
                                            
                                            <div className="space-y-1 mt-3">
                                                {item.variants?.map((v: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center text-sm border-b border-[var(--glass-border)] last:border-0 pb-1 last:pb-0">
                                                        <span className="text-[var(--text-secondary)] capitalize">{v.type}</span>
                                                        <span className="font-semibold text-[var(--text-primary)]">₹{v.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-[var(--glass-border)] opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(item._id, item.name)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}
