import { useState } from 'react'
import {
  X,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Upload,
  Tag,
  Barcode,
} from 'lucide-react'
import type { Product, ProductVariant, ProductOption, MockFile } from '@/types/product.types'
import type { Supplier } from '@/types/supplier.types'
import { generateSKU, generateBarcode } from '../utils/skuGenerator'
import { calculateSellingPrice, calculateMarkupFromSellingPrice } from '../utils/pricing'
import { productCategories } from '../data/mockData'
import { cn } from '@/lib/utils'

interface AddProductWizardProps {
  suppliers: Supplier[]
  onSave: (product: Product) => void
  onAddSupplier: (supplier: Supplier) => void
  onClose: () => void
}

function generateVariantsFromOptions(options: ProductOption[], productCode: string): ProductVariant[] {
  if (options.length === 0) {
    return [
      {
        id: `var-${Date.now()}-default`,
        sku: generateSKU(productCode, []),
        barcode: generateBarcode(),
        attributes: [],
        costPrice: 0,
        markupPercent: 0,
        sellingPrice: 0,
        stock: 0,
      },
    ]
  }

  const combineOptions = (opts: ProductOption[]): { option: string; value: string }[][] => {
    if (opts.length === 0) return [[]]
    const [first, ...rest] = opts
    const restCombos = combineOptions(rest)
    return first.values.flatMap((v) =>
      restCombos.map((combo) => [{ option: first.name, value: v }, ...combo])
    )
  }

  return combineOptions(options).map((attrs, i) => ({
    id: `var-${Date.now()}-${i}`,
    sku: generateSKU(productCode, attrs),
    barcode: generateBarcode(),
    attributes: attrs,
    costPrice: 0,
    markupPercent: 0,
    sellingPrice: 0,
    stock: 0,
  }))
}

// ─── Inline Add Supplier Form ────────────────────────────────────────────────
function AddSupplierForm({
  onSave,
  onCancel,
}: {
  onSave: (s: Supplier) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    vatTin: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: 'Net 30',
  })

  const handleSave = () => {
    if (!form.name) return
    onSave({
      id: `sup-${Date.now()}`,
      ...form,
      status: 'active',
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-neutral-900">Add New Supplier</h3>
          </div>
          <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { key: 'name', label: 'Supplier Name *', placeholder: 'e.g. Acme Corp.' },
            { key: 'vatTin', label: 'VAT / TIN', placeholder: '123-456-789-000' },
            { key: 'contactPerson', label: 'Contact Person', placeholder: 'Full name' },
            { key: 'email', label: 'Email', placeholder: 'contact@supplier.com' },
            { key: 'phone', label: 'Phone', placeholder: '+63 (2) 8000-0000' },
            { key: 'address', label: 'Address', placeholder: 'Full address' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
              <input
                type="text"
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Payment Terms</label>
            <select
              value={form.paymentTerms}
              onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name}
            className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Save Supplier
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────
export function AddProductWizard({ suppliers, onSave, onAddSupplier, onClose }: AddProductWizardProps) {
  const [step, setStep] = useState(1)
  const [showAddSupplier, setShowAddSupplier] = useState(false)

  // Step 1 state
  const [name, setName] = useState('')
  const [productCode, setProductCode] = useState('')
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [uom, setUom] = useState('Piece')
  const [supplierId, setSupplierId] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')

  // Step 2 state
  const [options, setOptions] = useState<ProductOption[]>([])
  const [newOptionName, setNewOptionName] = useState('')
  const [newOptionValues, setNewOptionValues] = useState('')

  // Step 3 state
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [files, setFiles] = useState<MockFile[]>([])

  const selectedCategory = productCategories.find((c) => c.label === category)
  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  )

  const handleStep1Next = () => {
    if (!name || !productCode) return
    setStep(2)
  }

  const handleStep2Next = () => {
    const generated = generateVariantsFromOptions(
      productType === 'variable' ? options : [],
      productCode
    )
    setVariants(generated)
    setStep(3)
  }

  const addOption = () => {
    if (!newOptionName || !newOptionValues) return
    const values = newOptionValues.split(',').map((v) => v.trim()).filter(Boolean)
    setOptions([...options, { id: `opt-${Date.now()}`, name: newOptionName, values }])
    setNewOptionName('')
    setNewOptionValues('')
  }

  const removeOption = (id: string) => {
    setOptions(options.filter((o) => o.id !== id))
  }

  const updateVariantCost = (variantId: string, cost: number) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v
        const selling = calculateSellingPrice(cost, v.markupPercent)
        return { ...v, costPrice: cost, sellingPrice: selling }
      })
    )
  }

  const updateVariantMarkup = (variantId: string, markup: number) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v
        const selling = calculateSellingPrice(v.costPrice, markup)
        return { ...v, markupPercent: markup, sellingPrice: selling }
      })
    )
  }

  const updateVariantSelling = (variantId: string, selling: number) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v
        const markup = calculateMarkupFromSellingPrice(v.costPrice, selling)
        return { ...v, sellingPrice: selling, markupPercent: markup }
      })
    )
  }

  const handleSave = () => {
    const product: Product = {
      id: `prod-${Date.now()}`,
      name,
      productCode,
      productType,
      category,
      subcategory,
      brand,
      description,
      uom,
      status: 'draft',
      supplierId,
      linkedSupplierIds: supplierId ? [supplierId] : [],
      mediaImages: [],
      tags: [],
      options,
      variants,
      files,
      createdAt: new Date().toISOString(),
    }
    onSave(product)
    onClose()
  }

  const steps = ['Catalog Info', 'Variants Setup', 'Pricing & Media']

  return (
    <>
      {showAddSupplier && (
        <AddSupplierForm
          onSave={(s) => {
            onAddSupplier(s)
            setSupplierId(s.id)
            setShowAddSupplier(false)
          }}
          onCancel={() => setShowAddSupplier(false)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
            <div>
              <h2 className="font-semibold text-neutral-900">Add New Product</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Step {step} of {steps.length}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step tracker */}
          <div className="px-6 py-4 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2">
              {steps.map((label, i) => {
                const s = i + 1
                const done = step > s
                const active = step === s
                return (
                  <div key={s} className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all',
                      done ? 'bg-emerald-600 text-white' :
                      active ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' :
                      'bg-neutral-100 text-neutral-500'
                    )}>
                      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                    </div>
                    <span className={cn('text-xs font-medium truncate', active ? 'text-emerald-700' : done ? 'text-emerald-600' : 'text-neutral-400')}>
                      {label}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={cn('flex-1 h-0.5 rounded-full mx-1', step > s ? 'bg-emerald-400' : 'bg-neutral-200')} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-auto p-6">
            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Product Name *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. ProElite Headset"
                      className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Product Code *</label>
                    <input
                      value={productCode}
                      onChange={(e) => setProductCode(e.target.value.toUpperCase())}
                      placeholder="e.g. PHW-GH-2024"
                      className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm font-mono text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Product Type</label>
                    <div className="flex gap-2">
                      {(['simple', 'variable'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setProductType(t)}
                          className={cn(
                            'flex-1 h-9 rounded-lg border text-xs font-medium capitalize transition-all',
                            productType === t
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-emerald-400'
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">UOM</label>
                    <select
                      value={uom}
                      onChange={(e) => setUom(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {['Piece', 'Unit', 'Box', 'Bottle', 'Kg', 'Liter', 'Set', 'Pack'].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setSubcategory('') }}
                      className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">Select category…</option>
                      {productCategories.map((c) => (
                        <option key={c.label} value={c.label}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Subcategory</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      disabled={!category}
                      className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:opacity-50"
                    >
                      <option value="">Select subcategory…</option>
                      {selectedCategory?.subcategories.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Brand</label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Brand name"
                    className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product description…"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Supplier selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-neutral-600">Supplier</label>
                    <button
                      onClick={() => setShowAddSupplier(true)}
                      className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add New Supplier
                    </button>
                  </div>
                  <input
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    placeholder="Search suppliers…"
                    className="w-full h-9 px-3 mb-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {filteredSuppliers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSupplierId(s.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all',
                          supplierId === s.id
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'border-neutral-200 text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                        )}
                      >
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                        <span className="font-medium truncate">{s.name}</span>
                        <span className="text-neutral-400 text-xs ml-auto shrink-0">{s.paymentTerms}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <div className="space-y-5">
                {productType === 'simple' ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    </div>
                    <p className="font-medium text-neutral-800">Simple Product</p>
                    <p className="text-sm text-neutral-500 mt-1">A default variant will be automatically created for this product.</p>
                    <p className="text-sm text-neutral-500">You can set pricing in the next step.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-neutral-800 mb-3">Add Product Options</h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Option Name</label>
                          <input
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            placeholder="e.g. Color, Size"
                            className="w-full h-8 px-2.5 rounded-md border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Values (comma-separated)</label>
                          <input
                            value={newOptionValues}
                            onChange={(e) => setNewOptionValues(e.target.value)}
                            placeholder="e.g. Red, Blue, Green"
                            className="w-full h-8 px-2.5 rounded-md border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                      <button
                        onClick={addOption}
                        disabled={!newOptionName || !newOptionValues}
                        className="h-8 px-3 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        Add Option
                      </button>
                    </div>

                    {options.length > 0 && (
                      <div className="space-y-2">
                        {options.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-neutral-200 rounded-lg">
                            <Tag className="w-4 h-4 text-neutral-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-800">{opt.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {opt.values.map((v) => (
                                  <span key={v} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">{v}</span>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => removeOption(opt.id)} className="text-neutral-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {options.length > 0 && (
                      <div className="px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700">
                        {options.reduce((acc, o) => acc * o.values.length, 1)} variant combination(s) will be generated
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ─── STEP 3 ─── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left text-xs font-medium text-neutral-500 pb-2">Variant</th>
                        <th className="text-left text-xs font-medium text-neutral-500 pb-2">SKU</th>
                        <th className="text-right text-xs font-medium text-neutral-500 pb-2">Cost (₱)</th>
                        <th className="text-right text-xs font-medium text-neutral-500 pb-2">Markup %</th>
                        <th className="text-right text-xs font-medium text-neutral-500 pb-2">Selling (₱)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v) => {
                        const label = v.attributes.length > 0
                          ? v.attributes.map((a) => a.value).join(' / ')
                          : 'Default'
                        return (
                          <tr key={v.id} className="border-b border-neutral-100 last:border-0">
                            <td className="py-2.5 pr-3">
                              <div>
                                <p className="font-medium text-neutral-800 text-xs">{label}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Barcode className="w-3 h-3 text-neutral-300" />
                                  <span className="text-xs text-neutral-400 font-mono">{v.barcode}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 pr-3">
                              <p className="text-xs font-mono text-neutral-600 truncate max-w-[130px]">{v.sku}</p>
                            </td>
                            <td className="py-2.5 pr-2">
                              <input
                                type="number"
                                value={v.costPrice || ''}
                                onChange={(e) => updateVariantCost(v.id, parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="w-24 h-7 px-2 rounded border border-neutral-200 text-xs text-right text-neutral-900 outline-none focus:ring-1 focus:ring-emerald-500 ml-auto block"
                              />
                            </td>
                            <td className="py-2.5 pr-2">
                              <input
                                type="number"
                                value={v.markupPercent ? v.markupPercent.toFixed(1) : ''}
                                onChange={(e) => updateVariantMarkup(v.id, parseFloat(e.target.value) || 0)}
                                placeholder="0.0"
                                className="w-20 h-7 px-2 rounded border border-neutral-200 text-xs text-right text-neutral-900 outline-none focus:ring-1 focus:ring-emerald-500 ml-auto block"
                              />
                            </td>
                            <td className="py-2.5">
                              <input
                                type="number"
                                value={v.sellingPrice ? v.sellingPrice.toFixed(2) : ''}
                                onChange={(e) => updateVariantSelling(v.id, parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="w-24 h-7 px-2 rounded border border-emerald-200 text-xs text-right text-emerald-700 font-semibold outline-none focus:ring-1 focus:ring-emerald-500 ml-auto block bg-emerald-50"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* File upload simulation */}
                <div>
                  <p className="text-xs font-medium text-neutral-600 mb-2">Attach Documents</p>
                  <div
                    className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer"
                    onClick={() => {
                      const mockFile: MockFile = {
                        id: `f-${Date.now()}`,
                        name: `Document_${Date.now()}.pdf`,
                        size: Math.floor(Math.random() * 2000000) + 100000,
                        type: 'application/pdf',
                      }
                      setFiles((prev) => [...prev, mockFile])
                    }}
                  >
                    <Upload className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500">Click to simulate file upload</p>
                    <p className="text-xs text-neutral-400 mt-0.5">PDF, Images accepted</p>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {files.map((f) => (
                        <div key={f.id} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700">
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-neutral-400">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                          <button onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))} className="text-neutral-300 hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 shrink-0 bg-neutral-50">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
              className="h-9 px-4 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-white transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <div className="flex items-center gap-2">
              {step < 3 ? (
                <button
                  onClick={step === 1 ? handleStep1Next : handleStep2Next}
                  disabled={step === 1 && (!name || !productCode)}
                  className="h-9 px-5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="h-9 px-5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
