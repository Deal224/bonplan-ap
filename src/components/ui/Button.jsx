import { motion } from 'framer-motion';

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, loading, className = '', type = 'button', fullWidth, style }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 select-none';

  const variants = {
    primary: 'bg-[#FFBE00] text-[#1A4731] hover:bg-[#e6ac00] active:scale-95 focus:ring-[#FFBE00] shadow-sm',
    secondary: 'bg-white dark:bg-slate-700 text-[#1A4731] dark:text-yellow-400 border border-[#1A4731] dark:border-yellow-500 hover:bg-[#FFF8E1] dark:hover:bg-slate-600 active:scale-95 focus:ring-[#1A4731]',
    ghost: 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95 focus:ring-red-400',
    success: 'bg-[#2E7D52] text-white hover:bg-[#256642] active:scale-95 focus:ring-[#2E7D52] shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-3 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      style={style}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {children}
    </motion.button>
  );
}
