import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  BarChart2,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

const trendData = [
  { month: 'Jan', value: 1850000, cost: 1100000 },
  { month: 'Feb', value: 2100000, cost: 1280000 },
  { month: 'Mar', value: 1950000, cost: 1200000 },
  { month: 'Apr', value: 2380000, cost: 1450000 },
  { month: 'May', value: 2600000, cost: 1580000 },
  { month: 'Jun', value: 2450000, cost: 1490000 },
  { month: 'Jul', value: 2850000, cost: 1720000 },
  { month: 'Aug', value: 3100000, cost: 1890000 },
  { month: 'Sep', value: 2900000, cost: 1780000 },
  { month: 'Oct', value: 3350000, cost: 2050000 },
  { month: 'Nov', value: 3600000, cost: 2200000 },
  { month: 'Dec', value: 3950000, cost: 2400000 },
]

const categoryData = [
  { name: 'Electronics', value: 1850 },
  { name: 'Furniture', value: 680 },
  { name: 'Chemicals', value: 420 },
  { name: 'Safety', value: 310 },
  { name: 'Office', value: 195 },
]

const recentActivity = [
  { id: 1, action: 'Stock Updated', product: 'ProElite Gaming Headset', qty: '+25 units', time: '2 min ago', type: 'in' },
  { id: 2, action: 'New Order', product: 'ErgoMax Executive Chair', qty: '-3 units', time: '14 min ago', type: 'out' },
  { id: 3, action: 'Low Stock Alert', product: 'QuantumView 27" Monitor', qty: '3 units left', time: '1 hr ago', type: 'alert' },
  { id: 4, action: 'Product Added', product: 'SafeGuard PPE Gloves', qty: '+615 units', time: '3 hr ago', type: 'in' },
  { id: 5, action: 'Supplier Invoice', product: 'TechVision Distributors', qty: '₱85,200', time: '5 hr ago', type: 'invoice' },
]

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', notation: 'compact', maximumFractionDigits: 1 }).format(val)

const EMERALD_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Operations Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Real-time overview of your warehouse operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Inventory Value',
            value: '₱3.95M',
            change: '+12.4%',
            positive: true,
            icon: DollarSign,
            sub: 'vs last month',
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Total SKUs',
            value: '1,284',
            change: '+38',
            positive: true,
            icon: Package,
            sub: 'new this month',
            color: 'bg-neutral-100 text-neutral-600',
          },
          {
            label: 'Low Stock Items',
            value: '23',
            change: '+5',
            positive: false,
            icon: AlertTriangle,
            sub: 'need reorder',
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Monthly Turnover',
            value: '₱842K',
            change: '+8.7%',
            positive: true,
            icon: TrendingUp,
            sub: 'vs last month',
            color: 'bg-emerald-50 text-emerald-600',
          },
        ].map(({ label, value, change, positive, icon: Icon, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                  positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}
              >
                {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-neutral-500 text-xs mt-0.5">{label}</p>
            <p className="text-neutral-400 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Inventory Value Trend (area chart) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Inventory Value Trends</h3>
              <p className="text-neutral-500 text-xs mt-0.5">12-month overview · Selling vs Cost</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" />Selling</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-neutral-300 inline-block" />Cost</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), '']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Area type="monotone" dataKey="cost" stroke="#d1d5db" strokeWidth={1.5} fill="url(#costGrad)" />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#valueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-neutral-900 text-sm">Value by Category</h3>
            <p className="text-neutral-500 text-xs mt-0.5">Top 5 categories (in ₱K)</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={65} />
              <Tooltip formatter={(v) => [`₱${Number(v ?? 0)}K`, 'Value']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={EMERALD_COLORS[i % EMERALD_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 text-sm">Recent Activity</h3>
            <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">View all</button>
          </div>
          <div className="space-y-1">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === 'in' ? 'bg-emerald-50 text-emerald-600' :
                  item.type === 'out' ? 'bg-neutral-100 text-neutral-600' :
                  item.type === 'alert' ? 'bg-amber-50 text-amber-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {item.type === 'in' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {item.type === 'out' && <ArrowDownRight className="w-3.5 h-3.5" />}
                  {item.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {item.type === 'invoice' && <ShoppingCart className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{item.product}</p>
                  <p className="text-xs text-neutral-500">{item.action}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-semibold ${
                    item.type === 'in' ? 'text-emerald-600' :
                    item.type === 'alert' ? 'text-amber-600' :
                    'text-neutral-600'
                  }`}>{item.qty}</p>
                  <p className="text-xs text-neutral-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <h3 className="font-semibold text-neutral-900 text-sm mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: 'Active Products', value: '4', icon: Package, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Draft Products', value: '1', icon: BarChart2, color: 'text-amber-600 bg-amber-50' },
              { label: 'Total Variants', value: '17', icon: Activity, color: 'text-neutral-600 bg-neutral-100' },
              { label: 'Active Suppliers', value: '3', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-neutral-600">{label}</span>
                </div>
                <span className="text-sm font-bold text-neutral-900">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800 mb-1">System Health</p>
            <div className="w-full bg-emerald-100 rounded-full h-1.5 mb-1">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '87%' }} />
            </div>
            <p className="text-xs text-emerald-600">87% · All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  )
}
