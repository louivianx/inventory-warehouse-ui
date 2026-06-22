import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Truck,
  Calculator,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  onLogout: () => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Product Management', icon: Package },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'accounting', label: 'Accounting', icon: Calculator },
]

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function CollapsibleSidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col bg-neutral-900 border-r border-neutral-800 shrink-0 transition-all duration-300 ease-in-out relative',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Header with logo + toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-neutral-800 min-h-[60px]">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm truncate">Astreablue</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center mx-auto">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0',
            collapsed && 'absolute -right-3 top-4 z-10 bg-neutral-800 border border-neutral-700 rounded-full w-6 h-6 shadow-lg'
          )}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id
          return (
            <div key={id} className="relative group">
              <button
                onClick={() => onNavigate(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-neutral-800 text-emerald-400'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-neutral-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-neutral-700">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-800" />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div className="py-3 px-2 border-t border-neutral-800 space-y-0.5">
        {bottomItems.map(({ id, label, icon: Icon }) => (
          <div key={id} className="relative group">
            <button
              onClick={() => onNavigate(id)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/70 transition-all"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-neutral-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-neutral-700">
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-800" />
              </div>
            )}
          </div>
        ))}

        <div className="relative group">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Sign Out</span>}
          </button>
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-neutral-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-neutral-700">
              Sign Out
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-800" />
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
