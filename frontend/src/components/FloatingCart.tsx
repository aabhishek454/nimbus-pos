"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight, X } from "lucide-react";
import { formatINR } from "@/utils/currency";
import GlassButton from "./GlassButton";
import { haptics } from "@/utils/haptics";

interface FloatingCartProps {
  items: any[];
  onPlaceOrder: () => void;
  onClear: () => void;
}

export default function FloatingCart({ items, onPlaceOrder, onClear }: FloatingCartProps) {
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-28 left-6 right-6 z-50 pointer-events-none flex justify-center">
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className="pointer-events-auto"
      >
        <div className="glass-panel px-6 py-4 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 flex items-center gap-6 min-w-[320px] max-w-[90vw]">
          <div className="relative">
            <div className="w-12 h-12 bg-[var(--primary)] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(79,121,255,0.4)]">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <motion.span
              key={totalCount}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-2 -right-2 bg-white text-[var(--primary)] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-[var(--primary)]"
            >
              {totalCount}
            </motion.span>
          </div>

          <div className="flex-1">
            <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-black">Current Order</p>
            <p className="text-xl font-black text-white">{formatINR(totalAmount)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { haptics.medium(); onClear(); }}
              className="p-2 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <GlassButton 
              onClick={() => { haptics.success(); onPlaceOrder(); }}
              className="!py-2.5 !px-5 !rounded-2xl shadow-[0_8px_20px_rgba(79,121,255,0.3)] !bg-[var(--primary)]"
            >
              <span className="text-xs font-black uppercase tracking-widest flex items-center gap-1">
                Checkout <ChevronRight className="w-4 h-4" />
              </span>
            </GlassButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
