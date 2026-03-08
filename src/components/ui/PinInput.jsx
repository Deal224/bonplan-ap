import { useRef } from 'react';

export function PinInput({ value, onChange, length = 4, secret = false }) {
  const inputs = useRef([]);

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[idx] = char;
    const next = arr.join('');
    onChange(next);
    if (char && idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
      const arr = value.split('');
      arr[idx - 1] = '';
      onChange(arr.join(''));
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(paste.padEnd(length, '').slice(0, length));
    inputs.current[Math.min(paste.length, length - 1)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type={secret ? 'password' : 'text'}
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`
            w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all
            ${value[i]
              ? 'border-[#FFBE00] bg-[#FFF8E1] dark:bg-yellow-900/30 text-[#1A4731] dark:text-yellow-400'
              : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[#1A4731] dark:text-white'}
            focus:border-[#FFBE00] focus:ring-2 focus:ring-[#FFBE00]/20
          `}
        />
      ))}
    </div>
  );
}
