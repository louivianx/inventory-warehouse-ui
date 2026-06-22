import { useState } from 'react'
import { Eye, EyeOff, BarChart3, RefreshCw, BookOpen, Shield } from 'lucide-react'

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 800)
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left: Brand Info Panel (60%) */}
      <div className="hidden lg:flex lg:w-[60%] flex-col justify-between bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950 p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-900/10 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(52,211,153,1) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Logo area */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-emerald-400 font-semibold tracking-widest text-xs uppercase">
              Astreablue Intelligence Inc.
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div className="max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Inventory &{' '}
              <span className="text-emerald-400">Warehouse</span>
              <br />
              Management System
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed mb-10">
              Enterprise-grade inventory intelligence for modern supply chain operations.
            </p>

            {/* Feature list */}
            <div className="grid gap-4">
              {[
                {
                  icon: BarChart3,
                  title: 'Real-time Analytics',
                  desc: 'Live inventory dashboards with actionable KPI insights and trend forecasting.',
                },
                {
                  icon: RefreshCw,
                  title: 'Automated Stock Replenishment',
                  desc: 'Smart reorder triggers with supplier integration and demand forecasting.',
                },
                {
                  icon: BookOpen,
                  title: 'Double-Entry Accounting Integration',
                  desc: 'Seamless journal entries and financial reconciliation for every movement.',
                },
                {
                  icon: Shield,
                  title: 'Compliance & Audit Ready',
                  desc: 'Complete audit trail with role-based access controls and tamper-proof logs.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{title}</p>
                    <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-neutral-600 text-xs">
            © 2024 Astreablue Intelligence Inc. · All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: Login Panel (40%) */}
      <div className="flex-1 lg:w-[40%] flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-neutral-900 text-sm">Astreablue Intelligence</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">Welcome back</h2>
            <p className="text-neutral-500 text-sm">Sign in to your workspace account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 text-sm placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-neutral-200 bg-white text-neutral-900 text-sm placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Remember me / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <p className="text-xs text-neutral-500 text-center">
              <span className="font-medium text-neutral-700">Demo Mode</span> · Enter any email and password to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
