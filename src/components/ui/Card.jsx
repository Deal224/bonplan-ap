import { motion } from 'framer-motion';

export function Card({ children, className = '', onClick, hover = false }) {
  const base = 'bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden';

  if (onClick || hover) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{ y: -2, shadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        whileTap={{ scale: 0.99 }}
        className={`${base} cursor-pointer transition-shadow hover:shadow-md ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${base} ${className}`}>
      {children}
    </div>
  );
}
