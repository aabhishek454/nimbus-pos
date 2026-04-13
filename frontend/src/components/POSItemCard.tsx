import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { haptics } from "@/utils/haptics";
import { formatINR } from "@/utils/currency";

interface POSItemCardProps {
  item: any;
  onAdd: () => void;
  onRemove: () => void;
  quantity: number;
}

export default function POSItemCard({ item, onAdd, onRemove, quantity }: POSItemCardProps) {
  const [isFlashing, setIsFlashing] = useState(false);

  const handleAdd = () => {
    haptics.light();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);
    onAdd();
  };

  const handleRemove = () => {
    haptics.light();
    onRemove();
  };

  return (
    <motion.div
      whileHover={{ 
        rotateY: 8, 
        rotateX: -8, 
        scale: 1.05,
        z: 50
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="preserve-3d relative group"
    >
      <div className={`glass-panel p-4 rounded-[28px] h-full flex flex-col justify-between border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] transition-all duration-300 relative overflow-hidden ${isFlashing ? 'ring-2 ring-[var(--primary)] bg-[var(--primary)]/10' : ''}`}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        {/* Flash Overlay */}
        <AnimatePresence>
          {isFlashing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--primary)]/20 z-0"
            />
          )}
        </AnimatePresence>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-base leading-tight text-white group-hover:text-[var(--primary)] transition-colors">{item.name}</h3>
            {quantity > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-[var(--primary)] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(79,121,255,0.4)]"
              >
                {quantity}x
              </motion.span>
            )}
          </div>
          <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-widest font-bold">
            {item.category || "General"}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between relative z-10">
          <span className="text-sm font-black text-white">{formatINR(item.variants?.[0]?.price || 0)}</span>
          
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-2xl p-0.5 border border-white/5">
            {quantity > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-white/70"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleAdd(); }}
              className="p-1.5 bg-[var(--primary)] text-white rounded-xl shadow-lg hover:shadow-[var(--primary)]/40 transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
