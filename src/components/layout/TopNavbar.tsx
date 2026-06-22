import { Bell, Search, ChevronDown } from 'lucide-react'

interface TopNavbarProps {
  activePage: string
}

const pageLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Product Management',
  suppliers: 'Suppliers',
  accounting: 'Accounting',
  settings: 'Settings',
}

export function TopNavbar({ activePage }: TopNavbarProps) {
  return (
    <header className="h-[60px] bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-neutral-400 text-sm">Astreablue</span>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-900 text-sm font-semibold">{pageLabels[activePage] ?? activePage}</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Global search */}
        <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-400 text-sm w-52">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>Quick search...</span>
        </div>

        {/* Notification bell */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-neutral-100 transition-colors">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-sm font-medium text-neutral-700 hidden md:block">Admin</span>
          <ChevronDown className="w-3 h-3 text-neutral-400 hidden md:block" />
        </button>
      </div>
    </header>
  )
}
