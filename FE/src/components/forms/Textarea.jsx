import React from 'react'

// ============================================
// Component Textarea
// ============================================
export function Textarea({
  label = '',
  error = '',
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
      <textarea
        className={`w-full px-4 py-2.5 bg-slate-800 border ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition-colors resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
}
