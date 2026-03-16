import React from 'react'
import { ChevronDownIcon } from 'lucide-react'

// ============================================
// Component Select
// ============================================
export function Select({
  label = '',
  error = '',
  options = [],
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full appearance-none px-4 py-2.5 pr-10 bg-slate-800 border ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'} rounded-lg text-white focus:outline-none transition-colors cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
}
