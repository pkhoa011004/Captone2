import React from 'react'
import { Outlet } from 'react-router-dom'

// ============================================
// Component Layout
// ============================================
export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
