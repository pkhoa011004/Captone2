import React from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
} from 'lucide-react'

// ============================================
// Color configuration
// ============================================
const colorClasses = {
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
}

// ============================================
// Component StatsCard
// ============================================
export function StatsCard({
  title = '',
  value = '0',
  subtitle = '',
  icon: Icon = MinusIcon,
  trend = 'neutral',
  trendValue = '',
  color = 'blue',
  delay = 0,
}) {
  const colors = colorClasses[color]
  const TrendIcon =
    trend === 'up'
      ? TrendingUpIcon
      : trend === 'down'
        ? TrendingDownIcon
        : MinusIcon
  const trendColor =
    trend === 'up'
      ? 'text-emerald-400'
      : trend === 'down'
        ? 'text-red-400'
        : 'text-slate-400'
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay,
      }}
      className={`relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 overflow-hidden`}
    >
      {/* Accent stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bg.replace('/20', '')}`}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {(subtitle || trendValue) && (
            <div className="flex items-center gap-2">
              {trend && (
                <span
                  className={`flex items-center gap-1 text-sm ${trendColor}`}
                >
                  <TrendIcon className="w-4 h-4" />
                  {trendValue}
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-slate-400">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </motion.div>
  )
}
