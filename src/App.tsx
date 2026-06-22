import { useState } from 'react'
import { LoginPage } from '@/features/auth/index'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/features/dashboard/index'
import { ProductManagementPage } from '@/features/product-management/index'
import { SuppliersPage } from '@/features/suppliers/index'
import { AccountingPage } from '@/features/accounting/index'

type Page = 'dashboard' | 'products' | 'suppliers' | 'accounting' | 'settings'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activePage, setActivePage] = useState<Page>('dashboard')

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />
      case 'products':
        return <ProductManagementPage />
      case 'suppliers':
        return <SuppliersPage />
      case 'accounting':
        return <AccountingPage />
      default:
        return (
          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
            This section is coming soon.
          </div>
        )
    }
  }

  return (
    <AppShell
      activePage={activePage}
      onNavigate={(page) => setActivePage(page as Page)}
      onLogout={() => setIsAuthenticated(false)}
    >
      {renderPage()}
    </AppShell>
  )
}
