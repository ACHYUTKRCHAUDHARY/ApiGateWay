// ═══════════════════════════════════════════════════════════════
// Toast System — bottom-right slide-in with mini mascot
// ═══════════════════════════════════════════════════════════════
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mascot } from '@/components/icons/Mascot';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-[12px] shadow-lg border"
              style={{
                background: t.type === 'error' ? '#FEF2F2' : t.type === 'success' ? '#F0FDF4' : 'var(--white)',
                borderColor: t.type === 'error' ? '#FECACA' : t.type === 'success' ? '#BBF7D0' : 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <Mascot size={28} mood={t.type === 'error' ? 'thinking' : 'happy'} />
              <span className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-body)' }}>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
