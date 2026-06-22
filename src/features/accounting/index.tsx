import { Calculator, BookOpen, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const journalEntries = [
  { id: 'JE-0024', date: '2024-12-22', description: 'Inventory Purchase – TechVision Distributors', debit: 85200, credit: 0, account: 'Inventory Asset' },
  { id: 'JE-0023', date: '2024-12-21', description: 'Cost of Goods Sold – Sales Order #1042', debit: 0, credit: 24800, account: 'COGS' },
  { id: 'JE-0022', date: '2024-12-20', description: 'VAT Input – GlobalPrime Office Invoice', debit: 10800, credit: 0, account: 'VAT Input' },
  { id: 'JE-0021', date: '2024-12-20', description: 'Accounts Payable Settlement', debit: 0, credit: 72000, account: 'Accounts Payable' },
  { id: 'JE-0020', date: '2024-12-19', description: 'Stock Adjustment – Damage Write-off', debit: 0, credit: 3200, account: 'Inventory Asset' },
]

export function AccountingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Accounting Integration</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Double-entry journal entries and financial reconciliation</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Inventory Asset', value: '₱3,950,000', icon: TrendingUp, positive: true, change: '+12.4%', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'COGS (MTD)', value: '₱842,500', icon: Calculator, positive: null, change: 'This month', color: 'bg-neutral-100 text-neutral-600' },
          { label: 'Accounts Payable', value: '₱185,200', icon: ArrowDownRight, positive: false, change: 'Outstanding', color: 'bg-amber-50 text-amber-600' },
          { label: 'VAT Input (MTD)', value: '₱48,600', icon: BookOpen, positive: null, change: 'Claimable', color: 'bg-neutral-100 text-neutral-600' },
        ].map(({ label, value, icon: Icon, positive, change, color }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-neutral-500 text-xs mt-0.5">{label}</p>
            <p className={`text-xs font-medium mt-1 flex items-center gap-0.5 ${positive === true ? 'text-emerald-600' : positive === false ? 'text-amber-600' : 'text-neutral-400'}`}>
              {positive === true && <ArrowUpRight className="w-3 h-3" />}
              {change}
            </p>
          </div>
        ))}
      </div>

      {/* Journal entries table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-neutral-500" />
            <h3 className="font-semibold text-neutral-900 text-sm">Recent Journal Entries</h3>
          </div>
          <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {['Entry #', 'Date', 'Description', 'Account', 'Debit', 'Credit'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {journalEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-semibold text-neutral-700">{entry.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-neutral-500">{entry.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-800">{entry.description}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{entry.account}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-mono ${entry.debit > 0 ? 'text-emerald-700 font-semibold' : 'text-neutral-300'}`}>
                      {entry.debit > 0 ? `₱${entry.debit.toLocaleString()}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-mono ${entry.credit > 0 ? 'text-red-600 font-semibold' : 'text-neutral-300'}`}>
                      {entry.credit > 0 ? `₱${entry.credit.toLocaleString()}` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
