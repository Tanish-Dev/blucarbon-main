import React from 'react';
import { X } from 'lucide-react';

const statusColors = {
  'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
  'In Review': 'bg-amber-50 text-amber-800 border-amber-200',
  'Monitoring': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Issued': 'bg-sky-50 text-sky-800 border-sky-200',
  'VM0033': 'bg-slate-100 text-slate-700 border-slate-200',
  'Vintage 2024': 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function Chip({ 
  children, 
  variant = 'default', 
  status = null, 
  removable = false, 
  onRemove = null,
  size = 'default'
}) {
  const getChipStyles = () => {
    if (status && statusColors[status]) {
      return statusColors[status];
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-[#00e07a] text-white border-[#00e07a]';
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'outline':
        return 'bg-transparent text-slate-600 border-slate-200 hover:bg-slate-50';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sizeStyles = size === 'sm' 
    ? 'text-xs px-2 py-1 h-6' 
    : 'text-sm px-3 py-1.5 h-8';

  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors
      ${getChipStyles()} ${sizeStyles}
    `}>
      <span>{children}</span>
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="p-0.5 hover:bg-black/10 rounded-full transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}