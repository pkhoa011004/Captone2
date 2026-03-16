import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import {
  BrainIcon,
  MonitorIcon,
  ClipboardCheckIcon,
  BarChart3Icon,
  StarIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  UsersIcon,
  TrophyIcon,
  BookOpenIcon,
  GaugeIcon,
} from 'lucide-react'

// ============================================
// Component Con: Feature Card
// ============================================
function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-colors"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <feature.icon className="w-7 h-7 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
      <p className="text-slate-400 leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

// ============================================
// Component Con: Step Card
// ============================================
function StepCard({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      className="relative"
    >
      {index < 2 && (
        <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent" />
      )}
      <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold mb-6">
          {step.number}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
        <p className="text-slate-400">{step.description}</p>
      </div>
    </motion.div>
  )
}

// ============================================
// Component Con: Testimonial Card
// ============================================
function TestimonialCard({ testimonial, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
    >
      <div className="flex items-center gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <StarIcon
            key={i}
            className="w-5 h-5 text-amber-400 fill-amber-400"
          />
        ))}
      </div>
      <p className="text-slate-300 mb-6 leading-relaxed">
        "{testimonial.content}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-white">{testimonial.name}</p>
          <p className="text-sm text-slate-400">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Component Con: Stat Card
// ============================================
function StatCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/10 mb-4">
        <stat.icon className="w-7 h-7 text-blue-400" />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-1">
        {stat.value}
      </p>
      <p className="text-sm text-slate-400">{stat.label}</p>
    </motion.div>
  )
}

// ============================================
// Main Component: LandingPage
// ============================================
export function LandingPage() {
  const navigate = useNavigate()
  const features = [
    {
      icon: BrainIcon,
      title: 'AI Learning Assistant',
      description:
        'Get instant explanations for any question. Our AI analyzes your mistakes and provides personalized study recommendations.',
    },
    {
      icon: MonitorIcon,
      title: '3D Driving Simulation',
      description:
        'Practice real driving scenarios in our high-fidelity 3D simulator. Master parallel parking, slope starts, and more.',
    },
    {
      icon: ClipboardCheckIcon,
      title: 'Smart Practice Tests',
      description:
        'Access 600+ official questions with adaptive difficulty. Track your progress and focus on weak areas.',
    },
    {
      icon: BarChart3Icon,
      title: 'Performance Analytics',
      description:
        'Detailed insights into your learning journey. See your strengths, weaknesses, and predicted exam readiness.',
    },
  ]
  const steps = [
    {
      number: '01',
      title: 'Sign Up & Choose License Type',
      description:
        "Create your account and select your target license (B1, B2, or C). We'll customize your learning path.",
    },
    {
      number: '02',
      title: 'Study & Practice with AI',
      description:
        'Learn traffic laws, take practice tests, and train in the 3D simulator with real-time AI feedback.',
    },
    {
      number: '03',
      title: 'Pass Your Driving Test',
      description:
        'Feel confident on exam day. Our students have a 95% first-attempt pass rate.',
    },
  ]
  const testimonials = [
    {
      name: 'Thai Kim Ngoc',
      role: 'B2 License Holder',
      avatar: 'T',
      content:
        'The 3D simulator was a game-changer. I practiced parallel parking hundreds of times before my test. Passed on the first try!',
      rating: 5,
    },
    {
      name: 'Dinh Minh Cong',
      role: 'B1 License Holder',
      avatar: 'D',
      content:
        'The AI explanations helped me understand why I was getting questions wrong. Much better than just memorizing answers.',
      rating: 5,
    },
    {
      name: 'Mai Phuoc Khoa',
      role: 'C License Holder',
      avatar: 'M',
      content:
        'As a truck driver, the specialized C license content was exactly what I needed. Highly recommend for commercial licenses.',
      rating: 5,
    },
  ]
  const stats = [
    {
      icon: UsersIcon,
      value: '10,000+',
      label: 'Students Trained',
    },
    {
      icon: TrophyIcon,
      value: '95%',
      label: 'Pass Rate',
    },
    {
      icon: BookOpenIcon,
      value: '600+',
      label: 'Practice Questions',
    },
    {
      icon: GaugeIcon,
      value: '3D',
      label: 'Driving Simulation',
    },
  ]
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{
                opacity: 0,
                x: -30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                AI-Powered Learning Platform
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Master the Road with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  AI-Powered
                </span>{' '}
                Training
              </h1>

              <p className="text-lg text-slate-300 max-w-xl">
                Combine interactive theory lessons, realistic 3D driving
                simulation, and intelligent AI feedback to prepare for your
                driver's license exam with confidence.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 group"
                >
                  Start Learning
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 border border-slate-700">
                  <PlayCircleIcon className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </motion.div>

            {/* Hero Visual - Stylized Dashboard */}
            <motion.div
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
              className="relative"
            >
              <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
                {/* Speedometer graphic */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Outer ring */}
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="12"
                      />
                      {/* Progress arc */}
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="url(#speedGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="424"
                        strokeDashoffset="106"
                        transform="rotate(-90 100 100)"
                      />
                      <defs>
                        <linearGradient
                          id="speedGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white">78%</span>
                      <span className="text-sm text-slate-400">Ready</span>
                    </div>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">47</p>
                    <p className="text-xs text-slate-400">Tests Done</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">12h</p>
                    <p className="text-xs text-slate-400">Sim Time</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">B2</p>
                    <p className="text-xs text-slate-400">License</p>
                  </div>
                </div>

                {/* Decorative car silhouette */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10">
                  <svg
                    viewBox="0 0 100 100"
                    fill="currentColor"
                    className="text-blue-400"
                  >
                    <path d="M90 50c0-5-2-9-5-12l-8-10c-3-4-8-6-13-6H36c-5 0-10 2-13 6l-8 10c-3 3-5 7-5 12v15c0 3 2 5 5 5h5c0 5 4 9 9 9s9-4 9-9h24c0 5 4 9 9 9s9-4 9-9h5c3 0 5-2 5-5V50zm-61-8l6-8c1-2 4-3 6-3h18c2 0 5 1 6 3l6 8H29zm-5 23c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5zm52 0c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Pass
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology
              with proven learning methods.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Get your driver's license in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Join thousands of successful drivers who passed their exams with
              DriveMaster
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Your License?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Join over 10,000 students who have successfully passed their
                driving tests with DriveMaster.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2 group"
              >
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-sm text-blue-200 mt-4">
                No credit card required • 7-day free trial
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">
                  Drive<span className="text-blue-500">Master</span>
                </span>
              </div>
              <p className="text-sm text-slate-400">
                AI-powered driver's license preparation platform with 3D
                simulation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    3D Simulator
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    AI Assistant
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © 2026 DriveMaster. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
