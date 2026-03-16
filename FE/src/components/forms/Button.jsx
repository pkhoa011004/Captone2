import React from 'react'

// ============================================
// Component Button
// ============================================
export function Button({
  children = '',
  variant = 'primary',
  size = 'md',
  icon = null,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
