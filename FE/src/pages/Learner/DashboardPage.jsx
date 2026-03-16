import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '../../components/Sidebar'
import { StatsCard } from '../../components/StatsCard'
import {
  HomeIcon,
  ClipboardListIcon,
  MonitorIcon,
  SparklesIcon,
  CalendarIcon,
  SettingsIcon,
  SearchIcon,
  BellIcon,
  ClipboardCheckIcon,
  TargetIcon,
  ClockIcon,
  CalendarDaysIcon,
  PlayIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrendingUpIcon,
  BookOpenIcon,
  AlertTriangleIcon,
  LightbulbIcon,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LearnerSimulator } from './LearnerSimulator'
import { LearnerAIAssistant } from './LearnerAIAssistant'
import { LearnerSchedule } from './LearnerSchedule'
import { LearnerSettings } from './LearnerSettings'

const sidebarItems = [
  {
    icon: HomeIcon,
    label: 'Dashboard',
    key: 'dashboard',
  },
  {
    icon: ClipboardListIcon,
    label: 'Practice Tests',
    key: 'practice-test',
  },
  {
    icon: MonitorIcon,
    label: '3D Simulator',
    key: 'simulator',
  },
  {
    icon: SparklesIcon,
    label: 'AI Assistant',
    key: 'ai-assistant',
  },
  {
    icon: CalendarIcon,
    label: 'Schedule',
    key: 'schedule',
  },
  {
    icon: SettingsIcon,
    label: 'Settings',
    key: 'settings',
  },
]
const lessons = [
  {
    id: 1,
    title: 'Traffic Signs & Signals',
    description: 'Learn to identify and understand all traffic signs',
    progress: 75,
    totalLessons: 12,
    completedLessons: 9,
    icon: '🚦',
  },
  {
    id: 2,
    title: 'Right of Way Rules',
    description: 'Master intersection and merging priorities',
    progress: 45,
    totalLessons: 8,
    completedLessons: 4,
    icon: '🛣️',
  },
  {
    id: 3,
    title: 'Emergency Procedures',
    description: 'Handle accidents and emergency situations',
    progress: 20,
    totalLessons: 6,
    completedLessons: 1,
    icon: '🚨',
  },
]
const aiRecommendations = [
  {
    id: 1,
    icon: AlertTriangleIcon,
    title: 'Focus on Speed Limits',
    description:
      'You missed 3 questions about speed limits in residential areas.',
    color: 'amber',
  },
  {
    id: 2,
    icon: BookOpenIcon,
    title: 'Review Parking Rules',
    description: 'Your accuracy on parking regulations is below average.',
    color: 'blue',
  },
  {
    id: 3,
    icon: LightbulbIcon,
    title: 'Try the Simulator',
    description: 'Practice parallel parking in our 3D simulator.',
    color: 'emerald',
  },
]
const recentTests = [
  {
    id: 1,
    date: 'Mar 1, 2026',
    topic: 'Traffic Signs',
    score: 92,
    passed: true,
  },
  {
    id: 2,
    date: 'Feb 28, 2026',
    topic: 'Right of Way',
    score: 78,
    passed: true,
  },
  {
    id: 3,
    date: 'Feb 26, 2026',
    topic: 'Speed Limits',
    score: 65,
    passed: false,
  },
  {
    id: 4,
    date: 'Feb 24, 2026',
    topic: 'Parking Rules',
    score: 88,
    passed: true,
  },
  {
    id: 5,
    date: 'Feb 22, 2026',
    topic: 'Emergency Procedures',
    score: 72,
    passed: true,
  },
]

const routeMap = {
  dashboard: '/dashboard',
  'practice-test': '/practice-test',
  simulator: '/simulator',
  'ai-assistant': '/ai-assistant',
  schedule: '/schedule',
  settings: '/settings',
}

const pathToKey = {
  '/dashboard': 'dashboard',
  '/practice-test': 'practice-test',
  '/simulator': 'simulator',
  '/ai-assistant': 'ai-assistant',
  '/schedule': 'schedule',
  '/settings': 'settings',
}
export function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const activeItem = pathToKey[location.pathname] || 'dashboard'

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleSidebarClick = (key) => {
    const route = routeMap[key]
    if (route) {
      navigate(route)
    }
  }
  const getHeaderTitle = () => {
    switch (activeItem) {
      case 'simulator':
        return '3D Simulator'
      case 'ai-assistant':
        return 'AI Assistant'
      case 'schedule':
        return 'Schedule'
      case 'settings':
        return 'Settings'
      case 'dashboard':
      default:
        return `Welcome back, ${user?.name || 'Student'}! 👋`
    }
  }
  const getHeaderSubtitle = () => {
    switch (activeItem) {
      case 'simulator':
        return 'Practice driving in realistic scenarios'
      case 'ai-assistant':
        return 'Get instant help with driving questions'
      case 'schedule':
        return 'Manage your classes and exam preparation'
      case 'settings':
        return 'Manage your account and preferences'
      case 'dashboard':
      default:
        return "You're making great progress. Keep up the momentum!"
    }
  }
  const renderContent = () => {
    switch (activeItem) {
      case 'simulator':
        return <LearnerSimulator />
      case 'ai-assistant':
        return <LearnerAIAssistant />
      case 'schedule':
        return <LearnerSchedule />
      case 'settings':
        return <LearnerSettings />
      case 'dashboard':
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Tests Completed"
                value="47/60"
                subtitle="78% complete"
                icon={ClipboardCheckIcon}
                color="blue"
                delay={0}
              />
              <StatsCard
                title="Accuracy Rate"
                value="78%"
                icon={TargetIcon}
                trend="up"
                trendValue="+5%"
                color="emerald"
                delay={0.1}
              />
              <StatsCard
                title="Study Hours"
                value="32.5h"
                subtitle="this month"
                icon={ClockIcon}
                color="amber"
                delay={0.2}
              />
              <StatsCard
                title="Next Exam"
                value="May 15"
                subtitle="43 days left"
                icon={CalendarDaysIcon}
                color="red"
                delay={0.3}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Continue Learning */}
              <div className="lg:col-span-2">
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Continue Learning
                    </h2>
                    <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                      View all
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {lessons.map((lesson, index) => (
                      <motion.div
                        key={lesson.id}
                        initial={{
                          opacity: 0,
                          x: -20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: 0.3 + index * 0.1,
                        }}
                        className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl group hover:border-blue-500/50 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center text-2xl">
                          {lesson.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-slate-400 mb-2">
                            {lesson.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                                style={{
                                  width: `${lesson.progress}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {lesson.completedLessons}/{lesson.totalLessons}{' '}
                              lessons
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/practice-test')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 opacity-0 group-hover:opacity-100"
                        >
                          <PlayIcon className="w-4 h-4" />
                          Continue
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* AI Recommendations */}
              <div>
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
                  <div className="flex items-center gap-2 mb-6">
                    <SparklesIcon className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">
                      AI Recommendations
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {aiRecommendations.map((rec, index) => {
                      const colorClasses = {
                        amber: 'bg-amber-500/10 text-amber-400',
                        blue: 'bg-blue-500/10 text-blue-400',
                        emerald: 'bg-emerald-500/10 text-emerald-400',
                      }
                      const Icon = rec.icon
                      return (
                        <motion.div
                          key={rec.id}
                          initial={{
                            opacity: 0,
                            x: 20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: 0.4 + index * 0.1,
                          }}
                          className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[rec.color]}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white mb-1">
                                {rec.title}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Recent Test Results */}
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
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Recent Test Results
                </h2>
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  View all
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Topic
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTests.map((test, index) => (
                      <motion.tr
                        key={test.id}
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
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {test.date}
                        </td>
                        <td className="py-4 px-4 text-sm text-white font-medium">
                          {test.topic}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${test.score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                              {test.score}%
                            </span>
                            <TrendingUpIcon
                              className={`w-4 h-4 ${test.score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${test.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                          >
                            {test.passed ? (
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                            ) : (
                              <XCircleIcon className="w-3.5 h-3.5" />
                            )}
                            {test.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )
    }
  }
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleSidebarClick}
        userName={user?.name || 'Student'}
      />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search lessons, tests, or topics..."
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
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {user?.name || 'Student'}
                  </p>
                  <p className="text-xs text-slate-400">{user?.license_type || 'A1'} License</p>
                </div>
              </div>
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
