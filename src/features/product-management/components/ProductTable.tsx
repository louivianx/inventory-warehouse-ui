import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Search,
  Eye,
  Pencil,
  Trash2,
  Package,
  Filter,
  ImageIcon,
} from 'lucide-react'
import type { Product } from '@/types/product.types'
import type { Supplier } from '@/types/supplier.types'
import { formatCurrency, formatPriceRange } from '../utils/pricing'
import { productCategories } from '../data/mockData'
import { cn } from '@/lib/utils'

interface ProductTableProps {
  products: Product[]
  suppliers: Supplier[]
  onView: (product: Product) => void
  onDelete: (id: string) => void
}

const statusConfig = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  inactive: 'bg-red-50 text-red-700 border-red-200',
}

export function ProductTable({ products, suppliers, onView, onDelete }: ProductTableProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [subcategoryFilter, setSubcategoryFilter] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [variantSearch, setVariantSearch] = useState<Record<string, string>>({})

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedCategory = productCategories.find((c) => c.label === categoryFilter)

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.productCode.toLowerCase().includes(q) ||
      p.variants.some(
        (v) => v.sku.toLowerCase().includes(q) || v.barcode.includes(q)
      )
    const matchCat = !categoryFilter || p.category === categoryFilter
    const matchSub = !subcategoryFilter || p.subcategory === subcategoryFilter
    return matchSearch && matchCat && matchSub
  })

  const getSupplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? '—'

  return (
    <div className="flex flex-col gap-4">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white border border-neutral-200 flex-1 min-w-48 max-w-xs shadow-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, SKU, barcode…"
            className="flex-1 text-sm text-neutral-700 placeholder:text-neutral-400 bg-transparent outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-neutral-300 hover:text-neutral-500 transition-colors">×</button>
          )}
        </div>

        <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white border border-neutral-200 shadow-sm">
          <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setSubcategoryFilter('') }}
            className="text-sm text-neutral-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {productCategories.map((c) => (
              <option key={c.label} value={c.label}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white border border-neutral-200 shadow-sm">
          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            disabled={!categoryFilter}
            className="text-sm text-neutral-700 bg-transparent outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="">All Subcategories</option>
            {selectedCategory?.subcategories.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-neutral-400">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {/* chevron col — always present for layout alignment */}
                <th className="w-10" />
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Supplier</th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Cost</th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Selling</th>
                <th className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Variants</th>
                <th className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Package className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">No products found</p>
                  </td>
                </tr>
              )}
              {filtered.map((product) => {
                const hasVariants = product.variants.length > 1 ||
                  (product.variants.length === 1 && product.variants[0].attributes.length > 0)
                const isExpanded = expandedRows.has(product.id)
                const costs = product.variants.map((v) => v.costPrice)
                const sellings = product.variants.map((v) => v.sellingPrice)
                const vSearch = variantSearch[product.id] ?? ''
                const filteredVariants = product.variants.filter(
                  (v) =>
                    !vSearch ||
                    v.sku.toLowerCase().includes(vSearch.toLowerCase()) ||
                    v.barcode.includes(vSearch) ||
                    v.attributes.some((a) => a.value.toLowerCase().includes(vSearch.toLowerCase()))
                )

                return (
                  <>
                    <tr
                      key={product.id}
                      onClick={!hasVariants ? () => onView(product) : undefined}
                      className={cn(
                        'border-b border-neutral-100 transition-colors',
                        isExpanded && 'bg-neutral-50/50',
                        !hasVariants
                          ? 'hover:bg-emerald-50/30 cursor-pointer'
                          : 'hover:bg-neutral-50/70'
                      )}
                    >
                      {/* Chevron — only shown for products with variants */}
                      <td className="pl-3 pr-1 py-3">
                        {hasVariants ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleRow(product.id) }}
                            className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            {isExpanded
                              ? <ChevronDown className="w-3.5 h-3.5" />
                              : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <div className="w-6 h-6" />
                        )}
                      </td>

                      {/* Product name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-neutral-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 leading-none">{product.name}</p>
                            <p className="text-xs text-neutral-400 font-mono mt-0.5">{product.productCode}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-neutral-700">{product.category}</p>
                        <p className="text-xs text-neutral-400">{product.subcategory}</p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs text-neutral-600 truncate max-w-[120px]">{getSupplierName(product.supplierId)}</p>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <p className="text-xs text-neutral-600 font-mono">{formatPriceRange(costs)}</p>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <p className="text-xs font-semibold text-emerald-700 font-mono">{formatPriceRange(sellings)}</p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                          {product.variants.length}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border capitalize', statusConfig[product.status])}>
                          {product.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onView(product) }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id) }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Variant sub-table — only for products with variants */}
                    {hasVariants && isExpanded && (
                      <tr key={`${product.id}-variants`} className="border-b border-neutral-100 bg-neutral-50/40">
                        <td colSpan={9} className="px-4 pb-3 pt-1">
                          <div className="ml-8">
                            <div className="flex items-center gap-2 h-7 px-2.5 mb-2 rounded-md bg-white border border-neutral-200 w-56">
                              <Search className="w-3 h-3 text-neutral-300 shrink-0" />
                              <input
                                value={vSearch}
                                onChange={(e) => setVariantSearch((prev) => ({ ...prev, [product.id]: e.target.value }))}
                                placeholder="Filter variants…"
                                className="flex-1 text-xs text-neutral-600 bg-transparent outline-none placeholder:text-neutral-300"
                              />
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-neutral-200">
                                    <th className="text-left text-xs font-medium text-neutral-400 pb-1.5 pr-3 w-12">Image</th>
                                    <th className="text-left text-xs font-medium text-neutral-400 pb-1.5 pr-3">Attributes</th>
                                    <th className="text-left text-xs font-medium text-neutral-400 pb-1.5 pr-3">SKU</th>
                                    <th className="text-left text-xs font-medium text-neutral-400 pb-1.5 pr-3">Barcode</th>
                                    <th className="text-right text-xs font-medium text-neutral-400 pb-1.5 pr-3">Cost</th>
                                    <th className="text-right text-xs font-medium text-neutral-400 pb-1.5 pr-3">Markup</th>
                                    <th className="text-right text-xs font-medium text-neutral-400 pb-1.5">Selling</th>
                                    <th className="text-right text-xs font-medium text-neutral-400 pb-1.5 pl-3">Stock</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredVariants.map((v) => (
                                    <tr key={v.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-100/50 transition-colors">
                                      {/* Thumbnail */}
                                      <td className="py-2 pr-3">
                                        {v.image ? (
                                          <img
                                            src={v.image}
                                            alt=""
                                            className="w-10 h-10 object-cover rounded border border-neutral-200 shrink-0"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded border border-neutral-200 bg-neutral-100 flex items-center justify-center shrink-0">
                                            <ImageIcon className="w-4 h-4 text-neutral-300" />
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-2 pr-3">
                                        <div className="flex flex-wrap gap-1">
                                          {v.attributes.length > 0 ? (
                                            v.attributes.map((a) => (
                                              <span key={a.option} className="text-xs bg-white border border-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded">
                                                {a.option}: <strong>{a.value}</strong>
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-xs text-neutral-400 italic">Default</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-2 pr-3">
                                        <span className="text-xs font-mono text-neutral-600">{v.sku}</span>
                                      </td>
                                      <td className="py-2 pr-3">
                                        <span className="text-xs font-mono text-neutral-500">{v.barcode}</span>
                                      </td>
                                      <td className="py-2 pr-3 text-right">
                                        <span className="text-xs text-neutral-600">{formatCurrency(v.costPrice)}</span>
                                      </td>
                                      <td className="py-2 pr-3 text-right">
                                        <span className="text-xs text-neutral-500">{v.markupPercent.toFixed(1)}%</span>
                                      </td>
                                      <td className="py-2 text-right">
                                        <span className="text-xs font-semibold text-emerald-700">{formatCurrency(v.sellingPrice)}</span>
                                      </td>
                                      <td className="py-2 pl-3 text-right">
                                        <span className={cn('text-xs font-medium', v.stock < 10 ? 'text-amber-600' : 'text-neutral-600')}>
                                          {v.stock}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
