import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CarIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowLeftIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ============================================
// Component: Password Input Field
// ============================================
function PasswordInput({ id, label, value, onChange, showPassword, onToggleShowPassword, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          className="w-full pl-11 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOffIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================
// Component: Text Input Field
// ============================================
function TextInput({ id, label, icon: Icon, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  )
}

// ============================================
// Component: Login Form
// ============================================
function LoginForm({ formData, setFormData, showPassword, setShowPassword, handleSubmit, loading }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextInput
        id="email"
        label="Email Address"
        icon={MailIcon}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Enter your email"
        type="email"
      />

      <PasswordInput
        id="password"
        label="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword(!showPassword)}
        placeholder="Enter your password"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-400">Remember me</span>
        </label>
        <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}

// ============================================
// Component: Register Form
// ============================================
function RegisterForm({ formData, setFormData, showPassword, setShowPassword, handleSubmit, loading }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextInput
        id="name"
        label="Full Name"
        icon={UserIcon}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Enter your full name"
      />

      <TextInput
        id="email"
        label="Email Address"
        icon={MailIcon}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Enter your email"
        type="email"
      />

      <PasswordInput
        id="password"
        label="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword(!showPassword)}
        placeholder="Enter your password"
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword(!showPassword)}
        placeholder="Confirm your password"
      />

      <div>
        <label htmlFor="licenseType" className="block text-sm font-medium text-slate-300 mb-2">
          License Type
        </label>
        <select
          id="licenseType"
          value={formData.licenseType}
          onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
        >
          <option value="A1">A1 - Motorcycle</option>
          <option value="B1">B1 - Manual Car</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}

// ============================================
// Component: Social Login
// ============================================
function SocialLogin() {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-slate-900 text-slate-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>
    </div>
  )
}

// ============================================
// Main Component: LoginPage
// ============================================
export function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseType: 'A1',
    rememberMe: false,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      const apiUrl = 'http://localhost:5000/api/v1'
      
      if (mode === 'login') {
        // Check for admin credentials first
        if (formData.email === 'admin@drivemaster.com' && formData.password === 'admin') {
          navigate('/admin')
          setLoading(false)
          return
        }
        
        // User login
        const response = await fetch(`${apiUrl}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        })
        
        const data = await response.json()
        
        if (response.ok) {
          localStorage.setItem('token', data.data.token)
          localStorage.setItem('user', JSON.stringify(data.data.user))
          navigate('/dashboard')
        } else {
          setErrorMsg(data.message || 'Login failed')
        }
      } else {
        // User registration
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('Passwords do not match')
          setLoading(false)
          return
        }
        
        const response = await fetch(`${apiUrl}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            licenseType: formData.licenseType,
          }),
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setErrorMsg('')
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            licenseType: 'A1',
            rememberMe: false,
          })
          setMode('login')
          setErrorMsg('Account created successfully! Please log in.')
        } else {
          setErrorMsg(data.message || 'Registration failed')
        }
      }
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = () => {
    setFormData({
      ...formData,
      email: 'admin@drivemaster.com',
      password: 'admin',
    })
    setMode('login')
  }
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <CarIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Drive<span className="text-blue-500">Master</span>
              </span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-slate-800 rounded-lg p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              errorMsg.includes('successfully') 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50'
                : 'bg-red-500/10 text-red-400 border border-red-500/50'
            }`}>
              {errorMsg}
            </div>
          )}
          
          {mode === 'login' ? (
            <LoginForm
              formData={formData}
              setFormData={setFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          ) : (
            <RegisterForm
              formData={formData}
              setFormData={setFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          )}

          <SocialLogin />

          {/* Admin Login Link */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500 mb-3">Administrator Access</p>
            <button
              onClick={handleAdminLogin}
              className="text-sm px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg transition-colors border border-amber-600/50"
            >
              Continue as Administrator →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
