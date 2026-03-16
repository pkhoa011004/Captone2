import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { StatsCard } from '../../components/StatsCard'
import {
  CarIcon,
  HomeIcon,
  UsersIcon,
  ClipboardListIcon,
  Building2Icon,
  TrendingUpIcon,
  SettingsIcon,
  LogOutIcon,
  SearchIcon,
  BellIcon,
  PlusIcon,
  DownloadIcon,
  SendIcon,
  MoreVerticalIcon,
  DollarSignIcon,
  UserCheckIcon,
  PercentIcon,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useNavigate, useLocation } from 'react-router-dom'
import { AdminUserManagement } from './AdminUserManagement'
import { AdminExamManagement } from './AdminExamManagement'
import { AdminClassrooms } from './AdminClassrooms'
import { AdminAnalytics } from './AdminAnalytics'
import { AdminSettings } from './AdminSettings'

const sidebarItems = [
  {
    icon: HomeIcon,
    label: 'Dashboard',
    key: 'dashboard',
  },
  {
    icon: UsersIcon,
    label: 'User Management',
    key: 'users',
  },
  {
    icon: ClipboardListIcon,
    label: 'Exam Management',
    key: 'exams',
  },
  {
    icon: Building2Icon,
    label: 'Classrooms',
    key: 'classrooms',
  },
  {
    icon: TrendingUpIcon,
    label: 'Analytics',
    key: 'analytics',
  },
  {
    icon: SettingsIcon,
    label: 'Settings',
    key: 'settings',
  },
]
const monthlyRegistrations = [
  {
    month: 'Oct',
    users: 145,
  },
  {
    month: 'Nov',
    users: 189,
  },
  {
    month: 'Dec',
    users: 234,
  },
  {
    month: 'Jan',
    users: 278,
  },
  {
    month: 'Feb',
    users: 312,
  },
  {
    month: 'Mar',
    users: 356,
  },
]
const passRateByLicense = [
  {
    type: 'B1',
    rate: 82,
  },
  {
    type: 'B2',
    rate: 89,
  },
  {
    type: 'C',
    rate: 78,
  },
]
const recentUsers = [
  {
    id: 1,
    name: 'Thai Kim Ngoc',
    email: 'thai.ngoc@email.com',
    license: 'B2',
    date: 'Mar 3, 2026',
    status: 'active',
  },
  {
    id: 2,
    name: 'Dinh Minh Cong',
    email: 'minh.cong@email.com',
    license: 'B1',
    date: 'Mar 2, 2026',
    status: 'active',
  },
  {
    id: 3,
    name: 'Mai Phuoc Khoa',
    email: 'phuoc.khoa@email.com',
    license: 'C',
    date: 'Mar 1, 2026',
    status: 'pending',
  },
  {
    id: 4,
    name: 'Ta Hoang Huy',
    email: 'hoang.huy@email.com',
    license: 'B2',
    date: 'Feb 28, 2026',
    status: 'active',
  },
  {
    id: 5,
    name: 'Nguyen Minh Thanh',
    email: 'minh.thanh@email.com',
    license: 'B1',
    date: 'Feb 27, 2026',
    status: 'active',
  },
]
const quickActions = [
  {
    icon: PlusIcon,
    label: 'Add Question',
    color: 'blue',
  },
  {
    icon: Building2Icon,
    label: 'Create Classroom',
    color: 'emerald',
  },
  {
    icon: SendIcon,
    label: 'Send Notification',
    color: 'amber',
  },
  {
    icon: DownloadIcon,
    label: 'Export Report',
    color: 'purple',
  },
]

const adminRouteMap = {
  dashboard: '/admin',
  users: '/admin/users',
  exams: '/admin/exams',
  classrooms: '/admin/classrooms',
  analytics: '/admin/analytics',
  settings: '/admin/settings',
}

const adminPathToKey = {
  '/admin': 'dashboard',
  '/admin/users': 'users',
  '/admin/exams': 'exams',
  '/admin/classrooms': 'classrooms',
  '/admin/analytics': 'analytics',
  '/admin/settings': 'settings',
}
export function AdminDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeItem = adminPathToKey[location.pathname] || 'dashboard'
  const renderContent = () => {
    switch (activeItem) {
      case 'users':
        return <AdminUserManagement />
      case 'exams':
        return <AdminExamManagement />
      case 'classrooms':
        return <AdminClassrooms />
      case 'analytics':
        return <AdminAnalytics />
      case 'settings':
        return <AdminSettings />
      case 'dashboard':
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Users"
                value="1,247"
                icon={UsersIcon}
                trend="up"
                trendValue="+12%"
                color="blue"
                delay={0}
              />
              <StatsCard
                title="Active Learners"
                value="892"
                icon={UserCheckIcon}
                trend="up"
                trendValue="+8%"
                color="emerald"
                delay={0.1}
              />
              <StatsCard
                title="Pass Rate"
                value="87.3%"
                icon={PercentIcon}
                trend="up"
                trendValue="+2.1%"
                color="amber"
                delay={0.2}
              />
              <StatsCard
                title="Revenue"
                value="$45,200"
                icon={DollarSignIcon}
                trend="up"
                trendValue="+15%"
                subtitle="this month"
                color="blue"
                delay={0.3}
              />
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Monthly Registrations */}
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
                  delay: 0.2,
                }}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-6">
                  Monthly Registrations
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRegistrations}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{
                          fill: '#3b82f6',
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: '#3b82f6',
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Pass Rate by License Type */}
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
                  delay: 0.3,
                }}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-6">
                  Pass Rate by License Type
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={passRateByLicense}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="type" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                        formatter={(value) => [
                          `${value}%`,
                          'Pass Rate',
                        ]}
                      />
                      <Bar
                        dataKey="rate"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Users */}
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
                  delay: 0.4,
                }}
                className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Recent Users</h2>
                  <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    View all
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                          License
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            delay: 0.5 + index * 0.05,
                          }}
                          className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                                {user.name.charAt(0)}
                              </div>
                              <span className="text-sm text-white font-medium">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400">
                            {user.email}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded">
                              {user.license}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400">
                            {user.date}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}
                            >
                              {user.status === 'active' ? 'Active' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                              <MoreVerticalIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Quick Actions */}
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
                  delay: 0.5,
                }}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-6">
                  Quick Actions
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => {
                    const colorClasses = {
                      blue: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
                      emerald:
                        'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
                      amber:
                        'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
                      purple:
                        'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20',
                    }
                    const Icon = action.icon
                    return (
                      <motion.button
                        key={action.label}
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          delay: 0.6 + index * 0.1,
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${colorClasses[action.color]}`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium text-center">
                          {action.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">
                    System Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">API Status</span>
                      <span className="flex items-center gap-2 text-sm text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">
                        3D Simulator
                      </span>
                      <span className="flex items-center gap-2 text-sm text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">AI Service</span>
                      <span className="flex items-center gap-2 text-sm text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                        Running
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )
    }
  }
  const getHeaderTitle = () => {
    const item = sidebarItems.find((i) => i.key === activeItem)
    return item ? item.label : 'Admin Dashboard'
  }
  const getHeaderSubtitle = () => {
    switch (activeItem) {
      case 'users':
        return 'Manage student accounts and licenses'
      case 'exams':
        return 'Create and manage exam papers'
      case 'classrooms':
        return 'Manage learning batches and schedules'
      case 'analytics':
        return 'Detailed platform performance metrics'
      case 'settings':
        return 'Configure platform preferences'
      default:
        return "Overview of your platform's performance and activity."
    }
  }
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
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

        {/* Admin Badge */}
        <div className="px-6 py-3">
          <span className="inline-flex items-center px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full">
            Admin Panel
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.key
            return (
              <button
                key={item.key}
                onClick={() => navigate(adminRouteMap[item.key] || '/admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${isActive ? 'text-white bg-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`}
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Admin User
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
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

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users, content, or analytics..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Welcome Header */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              {getHeaderTitle()}
            </h1>
            <p className="text-slate-400">{getHeaderSubtitle()}</p>
          </motion.div>

          {renderContent()}
        </div>
      </main>
    </div>
  )
}
