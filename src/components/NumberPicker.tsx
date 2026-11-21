import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberPickerProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const NumberPicker: React.FC<NumberPickerProps> = ({
  id,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  disabled = false
}) => {
  const handleDecrement = () => {
    if (disabled) return;
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) {
      onChange(min);
    } else {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className="inline-flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border-2 border-slate-200 shadow-inner">
      <button
        type="button"
        id={id ? `${id}-minus` : undefined}
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-11 h-11 rounded-xl bg-white hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold text-xl shadow-sm flex items-center justify-center cursor-pointer border border-slate-200 transition-all"
        title="Disminuir"
      >
        <Minus className="w-5 h-5 stroke-[2.5]" />
      </button>

      <input
        type="number"
        id={id}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="w-20 text-center text-3xl font-extrabold text-slate-800 bg-transparent focus:outline-none focus:bg-white focus:rounded-lg py-1 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button
        type="button"
        id={id ? `${id}-plus` : undefined}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="w-11 h-11 rounded-xl bg-white hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-bold text-xl shadow-sm flex items-center justify-center cursor-pointer border border-slate-200 transition-all"
        title="Aumentar"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
