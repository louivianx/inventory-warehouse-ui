import { Truck, Building2, Phone, Mail, MapPin, CreditCard } from 'lucide-react'
import { useProducts } from '../product-management/hooks/useProducts'

export function SuppliersPage() {
  const { suppliers } = useProducts()

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Suppliers</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage supplier relationships and contact information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 text-sm leading-tight">{supplier.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">TIN: {supplier.vatTin}</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium capitalize">
                {supplier.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-sm">{supplier.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-sm truncate">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-sm">{supplier.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-neutral-600">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                <span className="text-sm leading-snug">{supplier.address}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <CreditCard className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="text-sm">Payment: <strong className="text-neutral-800">{supplier.paymentTerms}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
