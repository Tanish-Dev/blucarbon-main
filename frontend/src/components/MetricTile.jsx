import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricTile({ metric, compact = false }) {
  if (!metric) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
        <div className="text-center text-slate-500">No data available</div>
      </div>
    );
  }

  const { value, unit, label, trend } = metric;

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val % 1 === 0) return val.toString();
      return val.toFixed(1);
    }
    return val;
  };

  if (compact) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition-colors shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {formatValue(value)}<span className="text-sm text-slate-500 ml-1">{unit}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
          {trend && (
            <div className={`p-1.5 rounded-lg ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {formatValue(value)}<span className="text-base text-slate-500 ml-2">{unit}</span>
          </div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
        {trend && (
          <div className={`p-2 rounded-lg ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}