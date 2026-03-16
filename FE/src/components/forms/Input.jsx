import React from 'react'

// ============================================
// Component Input
// ============================================
export function Input({ label = '', error = '', className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-slate-800 border ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'} rounded-lg text-white placeholder-slate-500 focus:outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
}
