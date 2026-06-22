import { useState } from 'react'
import { X, ChevronDown, Package, Tag, Barcode, DollarSign, Building2, Phone, Mail, MapPin, CreditCard, FileText, ImageIcon } from 'lucide-react'
import type { Product } from '@/types/product.types'
import type { Supplier } from '@/types/supplier.types'
import { formatCurrency } from '../utils/pricing'
import { cn } from '@/lib/utils'

interface ProductDetailsModalProps {
  product: Product
  supplier?: Supplier
  onClose: () => void
}

export function ProductDetailsModal({ product, supplier, onClose }: ProductDetailsModalProps) {
  const [activeVariantId, setActiveVariantId] = useState(product.variants[0]?.id ?? '')
  const [supplierOpen, setSupplierOpen] = useState(false)

  const activeVariant = product.variants.find((v) => v.id === activeVariantId) ?? product.variants[0]

  const statusColor =
    product.status === 'active'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : product.status === 'draft'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200'

  const currentImage = activeVariant?.image ?? product.mediaImages?.[0] ?? null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
              <Package className="w-[1.125rem] h-[1.125rem] text-neutral-600" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">{product.name}</h2>
              <p className="text-xs text-neutral-500">{product.productCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusColor}`}>
              {product.status}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Primary image viewport */}
            <div className="flex gap-4">
              <div className="w-40 h-40 rounded-xl border-2 border-neutral-200 bg-neutral-50 flex items-center justify-center shrink-0 overflow-hidden">
                {currentImage ? (
                  <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-300">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
              {/* Variant thumbnail strip */}
              {product.variants.length > 1 && (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-40">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVariantId(v.id)}
                      className={cn(
                        'w-10 h-10 rounded-lg border-2 overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 transition-all',
                        activeVariantId === v.id
                          ? 'border-emerald-500 ring-2 ring-emerald-200'
                          : 'border-neutral-200 hover:border-emerald-300'
                      )}
                      title={v.attributes.map((a) => a.value).join(' / ') || 'Default'}
                    >
                      {v.image ? (
                        <img src={v.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-neutral-300" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              {/* Main info block */}
              <div className="flex-1 grid grid-cols-2 gap-2 content-start">
                {[
                  { label: 'Category', value: product.category },
                  { label: 'Subcategory', value: product.subcategory },
                  { label: 'Brand', value: product.brand },
                  { label: 'UOM', value: product.uom },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-neutral-50 rounded-lg p-2.5">
                    <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-neutral-900">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {product.description && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm text-neutral-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Variant selector pills */}
            {product.variants.length > 1 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const label =
                      variant.attributes.length > 0
                        ? variant.attributes.map((a) => a.value).join(' / ')
                        : 'Default'
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setActiveVariantId(variant.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                          activeVariantId === variant.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-emerald-400 hover:text-emerald-600'
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Variant details panel */}
            {activeVariant && (
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                  {activeVariant.attributes.length > 0
                    ? activeVariant.attributes.map((a) => `${a.option}: ${a.value}`).join(' · ')
                    : 'Default Variant'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-neutral-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Tag className="w-3.5 h-3.5 text-neutral-400" />
                      <p className="text-xs text-neutral-500">SKU</p>
                    </div>
                    <p className="text-xs font-mono font-semibold text-neutral-800 break-all">{activeVariant.sku}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-neutral-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Barcode className="w-3.5 h-3.5 text-neutral-400" />
                      <p className="text-xs text-neutral-500">Barcode</p>
                    </div>
                    <p className="text-xs font-mono font-semibold text-neutral-800">{activeVariant.barcode}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-neutral-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                      <p className="text-xs text-neutral-500">Cost Price</p>
                    </div>
                    <p className="text-sm font-bold text-neutral-900">{formatCurrency(activeVariant.costPrice)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      <p className="text-xs text-emerald-600">Selling Price</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-700">{formatCurrency(activeVariant.sellingPrice)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                  <span>Markup: <strong className="text-neutral-700">{activeVariant.markupPercent.toFixed(1)}%</strong></span>
                  <span>Stock: <strong className={activeVariant.stock < 10 ? 'text-amber-600' : 'text-neutral-700'}>{activeVariant.stock} {product.uom}s</strong></span>
                </div>
              </div>
            )}

            {/* Attached files */}
            {product.files.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Attached Documents</p>
                <div className="space-y-1.5">
                  {product.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200">
                      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="text-sm text-neutral-700 flex-1 truncate">{file.name}</span>
                      {file.tag && (
                        <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-neutral-200">{file.tag}</span>
                      )}
                      <span className="text-xs text-neutral-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplier section */}
            {supplier && (
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setSupplierOpen(!supplierOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-800">Supplier Information</span>
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{supplier.name}</span>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-neutral-400 transition-transform duration-200', supplierOpen && 'rotate-180')} />
                </button>
                {supplierOpen && (
                  <div className="px-4 pb-4 border-t border-neutral-100 bg-neutral-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      <div className="space-y-2">
                        {[
                          { icon: Building2, label: 'Company', value: supplier.name },
                          { icon: Tag, label: 'VAT / TIN', value: supplier.vatTin },
                          { icon: CreditCard, label: 'Payment Terms', value: supplier.paymentTerms },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">{label}</p>
                              <p className="text-sm font-medium text-neutral-800">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {[
                          { icon: Mail, label: 'Email', value: supplier.email },
                          { icon: Phone, label: 'Phone', value: supplier.phone },
                          { icon: MapPin, label: 'Address', value: supplier.address },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-start gap-2">
                            <Icon className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-neutral-400">{label}</p>
                              <p className="text-sm font-medium text-neutral-800 leading-snug">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
