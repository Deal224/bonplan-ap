export function Input({ label, type = 'text', value, onChange, placeholder, error, prefix, suffix, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-slate-400 text-sm select-none">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full py-3 px-4 rounded-2xl border bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm
            placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all
            focus:border-[#1A3C6E] focus:ring-2 focus:ring-[#1A3C6E]/10
            ${error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 dark:border-slate-600'}
            ${prefix ? 'pl-9' : ''}
            ${suffix ? 'pr-16' : ''}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 text-slate-400 dark:text-slate-500 text-sm font-medium select-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
