import { CollapsibleSidebar } from './CollapsibleSidebar'
import { TopNavbar } from './TopNavbar'

interface AppShellProps {
  activePage: string
  onNavigate: (page: string) => void
  onLogout: () => void
  children: React.ReactNode
}

export function AppShell({ activePage, onNavigate, onLogout, children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full bg-neutral-50 overflow-hidden">
      <CollapsibleSidebar activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNavbar activePage={activePage} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
