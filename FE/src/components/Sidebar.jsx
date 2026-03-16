import React from 'react'
import { motion } from 'framer-motion'
import { CarIcon, LogOutIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ============================================
// Component Sidebar
// ============================================
export function Sidebar({ items = [], activeItem = '', onItemClick = () => {}, userName = 'User' }) {
  const navigate = useNavigate()
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group"
          aria-label="DriveMaster Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CarIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Drive<span className="text-blue-500">Master</span>
          </span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.key
          return (
            <button
              key={item.key}
              onClick={() => onItemClick(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${isActive ? 'text-white bg-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-400">Learner</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Log out"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
