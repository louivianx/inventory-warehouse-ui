import { useState } from 'react'
import { Plus, Package } from 'lucide-react'
import type { Product } from '@/types/product.types'
import { useProducts } from './hooks/useProducts'
import { ProductTable } from './components/ProductTable'
import { ProductDetailsModal } from './components/ProductDetailsModal'
import { AddProductPage } from './components/AddProductPage'

type View = 'list' | 'add'

export function ProductManagementPage() {
  const { products, suppliers, addProduct, deleteProduct, addSupplier, getSupplierById } = useProducts()
  const [view, setView] = useState<View>('list')
  const [viewProduct, setViewProduct] = useState<Product | null>(null)

  if (view === 'add') {
    return (
      <AddProductPage
        suppliers={suppliers}
        onSave={addProduct}
        onAddSupplier={addSupplier}
        onBack={() => setView('list')}
      />
    )
  }

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Product Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Manage your product catalog, variants, and pricing
          </p>
        </div>
        <button
          onClick={() => setView('add')}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'All Products', count: products.length, active: true },
          { label: 'Active', count: products.filter((p) => p.status === 'active').length },
          { label: 'Draft', count: products.filter((p) => p.status === 'draft').length },
          { label: 'Total Variants', count: products.reduce((acc, p) => acc + p.variants.length, 0) },
        ].map(({ label, count, active }) => (
          <div
            key={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
              active
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200'
            }`}
          >
            <Package className="w-3 h-3" />
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
              active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}>
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <ProductTable
        products={products}
        suppliers={suppliers}
        onView={(p) => setViewProduct(p)}
        onDelete={deleteProduct}
      />

      {/* Details modal */}
      {viewProduct && (
        <ProductDetailsModal
          product={viewProduct}
          supplier={getSupplierById(viewProduct.supplierId)}
          onClose={() => setViewProduct(null)}
        />
      )}
    </div>
  )
}
