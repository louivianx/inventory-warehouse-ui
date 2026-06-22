import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Lock,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  FileText,
  ImageIcon,
  X,
  Building2,
  Upload,
  Tag,
  CheckCircle2,
  ChevronLeft,
  Search,
} from 'lucide-react'
import type { Product, ProductVariant, ProductOption, MockFile, DocFileTag } from '@/types/product.types'
import type { Supplier } from '@/types/supplier.types'
import { generateSKU, generateBarcode } from '../utils/skuGenerator'
import { calculateSellingPrice, calculateMarkupFromSellingPrice } from '../utils/pricing'
import { productCategories } from '../data/mockData'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────
interface LinkedSupplierEntry {
  supplierId: string
  supplierCode: string
  open: boolean
}

interface AddProductPageProps {
  suppliers: Supplier[]
  onSave: (product: Product) => void
  onAddSupplier: (supplier: Supplier) => void
  onBack: () => void
}

const DOC_TAGS: DocFileTag[] = ['User Manual', 'Safety Certificate', 'Warranty Guide', 'Compliance', 'Other']

const PRESET_ATTRIBUTES = ['Size', 'Color', 'Voltage', 'Material', 'Weight', 'Style']

// ─── Attribute Combobox ────────────────────────────────────────────────────────
function AttributeCombobox({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  // sync query when value changes externally
  useEffect(() => { setQuery(value) }, [value])

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = PRESET_ATTRIBUTES.filter((a) =>
    a.toLowerCase().includes(query.toLowerCase())
  )
  const showCustom = query.trim() && !PRESET_ATTRIBUTES.some((a) => a.toLowerCase() === query.toLowerCase())

  const select = (val: string) => {
    onChange(val)
    setQuery(val)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="e.g. Color, Size…"
          className="w-full h-9 pl-7 pr-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
        />
      </div>
      {open && (filtered.length > 0 || showCustom) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-30 overflow-hidden">
          {filtered.map((a) => (
            <button
              key={a}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(a) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left"
            >
              <Tag className="w-3 h-3 text-neutral-400" />
              {a}
            </button>
          ))}
          {showCustom && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(query.trim()) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 transition-colors text-left border-t border-neutral-100"
            >
              <Plus className="w-3 h-3" />
              Use "{query.trim()}" as custom attribute
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Value Tag Input ───────────────────────────────────────────────────────────
function ValueTagInput({
  values,
  onChange,
}: {
  values: string[]
  onChange: (vals: string[]) => void
}) {
  const [input, setInput] = useState('')

  const addValue = (raw: string) => {
    const val = raw.trim()
    if (!val || values.includes(val)) return
    onChange([...values, val])
    setInput('')
  }

  const removeValue = (v: string) => onChange(values.filter((x) => x !== v))

  return (
    <div className="flex-[2] min-w-0">
      <div className="min-h-9 px-2 py-1 rounded-lg border border-neutral-200 bg-white flex flex-wrap gap-1 items-center focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0"
          >
            {v}
            <button
              type="button"
              onClick={() => removeValue(v)}
              className="text-emerald-500 hover:text-red-500 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addValue(input) }
            if (e.key === 'Backspace' && !input && values.length > 0) removeValue(values[values.length - 1])
          }}
          onBlur={() => { if (input.trim()) addValue(input) }}
          placeholder={values.length === 0 ? 'Type values, press Enter or ,…' : ''}
          className="flex-1 min-w-[120px] text-sm text-neutral-700 outline-none bg-transparent py-0.5"
        />
      </div>
    </div>
  )
}

// ─── New Category Modal ───────────────────────────────────────────────────────
function NewCategoryModal({
  title,
  onSave,
  onClose,
}: { title: string; onSave: (val: string) => void; onClose: () => void }) {
  const [value, setValue] = useState('')
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-80">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-neutral-800 text-sm">{title}</p>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
        </div>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter name…"
          className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-8 px-3 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50">Cancel</button>
          <button
            disabled={!value.trim()}
            onClick={() => { onSave(value.trim()); onClose() }}
            className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Supplier Modal ───────────────────────────────────────────────────────
function AddSupplierModal({ onSave, onClose }: { onSave: (s: Supplier) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', vatTin: '', contactPerson: '', email: '', phone: '', address: '', paymentTerms: 'Net 30' })
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-neutral-900 text-sm">Add New Supplier</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          {[
            { key: 'name', label: 'Supplier Name *', placeholder: 'Acme Corp.' },
            { key: 'vatTin', label: 'VAT / TIN', placeholder: '123-456-789-000' },
            { key: 'contactPerson', label: 'Contact Person', placeholder: 'Full name' },
            { key: 'email', label: 'Email', placeholder: 'contact@supplier.com' },
            { key: 'phone', label: 'Phone', placeholder: '+63 (2) 8000-0000' },
            { key: 'address', label: 'Address', placeholder: 'Full address' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
              <input
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Payment Terms</label>
            <select
              value={form.paymentTerms}
              onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {['Net 30', 'Net 60', 'Net 15', 'COD', 'Prepaid'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50">Cancel</button>
          <button
            disabled={!form.name}
            onClick={() => { onSave({ id: `sup-${Date.now()}`, ...form, status: 'active' }); onClose() }}
            className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            Save Supplier
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Bento Card wrapper ───────────────────────────────────────────────────────
function BentoCard({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden', className)}>
      {title && (
        <div className="px-5 py-3.5 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full h-9 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white'

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AddProductPage({ suppliers: initialSuppliers, onSave, onAddSupplier, onBack }: AddProductPageProps) {
  // ── Supplier pool (local copy so new suppliers appear immediately) ──
  const [supplierPool, setSupplierPool] = useState<Supplier[]>(initialSuppliers)

  // ── General Info ──
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [productCode] = useState(`PRD-${Date.now().toString().slice(-6)}`)

  // ── Category ──
  const [extraCategories, setExtraCategories] = useState<string[]>([])
  const [extraSubMap, setExtraSubMap] = useState<Record<string, string[]>>({})
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [showNewCatModal, setShowNewCatModal] = useState<'cat' | 'sub' | null>(null)

  const allCategories = [...productCategories.map((c) => c.label), ...extraCategories]
  const baseSubcats = productCategories.find((c) => c.label === category)?.subcategories ?? []
  const allSubcats = [...baseSubcats, ...(extraSubMap[category] ?? [])]

  // ── Variant Builder ──
  const [draftRows, setDraftRows] = useState<{ id: string; key: string; values: string[] }[]>([])
  const [options, setOptions] = useState<ProductOption[]>([])

  const addDraftRow = () => {
    setDraftRows((prev) => [...prev, { id: `draft-${Date.now()}`, key: '', values: [] }])
  }

  // Use a ref to always have fresh options inside setState callbacks
  const optionsRef = useRef(options)
  useEffect(() => { optionsRef.current = options }, [options])

  const updateDraftValues = (id: string, values: string[]) => {
    setDraftRows((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, values } : r)
      const row = next.find((r) => r.id === id)
      const key = row?.key.trim() ?? ''
      const cur = optionsRef.current
      if (!key || values.length === 0) {
        const nextOpts = cur.filter((o) => o.id !== id)
        setOptions(nextOpts)
        rebuildVariants(nextOpts)
      } else {
        const nextOpts = cur.find((o) => o.id === id)
          ? cur.map((o) => o.id === id ? { ...o, name: key, values } : o)
          : [...cur, { id, name: key, values }]
        setOptions(nextOpts)
        rebuildVariants(nextOpts)
      }
      return next
    })
  }

  const updateDraftKeyCommit = (id: string, key: string) => {
    setDraftRows((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, key } : r)
      const row = next.find((r) => r.id === id)
      if (!row || row.values.length === 0 || !key.trim()) return next
      const cur = optionsRef.current
      const nextOpts = cur.find((o) => o.id === id)
        ? cur.map((o) => o.id === id ? { ...o, name: key.trim() } : o)
        : [...cur, { id, name: key.trim(), values: row.values }]
      setOptions(nextOpts)
      rebuildVariants(nextOpts)
      return next
    })
  }

  const removeDraftRow = (id: string) => {
    setDraftRows((prev) => prev.filter((r) => r.id !== id))
    const next = options.filter((o) => o.id !== id)
    setOptions(next)
    rebuildVariants(next)
  }

  // ── Variant Matrix ──
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: `var-default-${Date.now()}`,
      sku: generateSKU(productCode, []),
      barcode: generateBarcode(),
      attributes: [],
      costPrice: 0,
      markupPercent: 0,
      sellingPrice: 0,
      stock: 0,
    },
  ])

  const rebuildVariants = useCallback((opts: ProductOption[]) => {
    if (opts.length === 0) {
      setVariants([{
        id: `var-default-${Date.now()}`,
        sku: generateSKU(productCode, []),
        barcode: generateBarcode(),
        attributes: [],
        costPrice: 0,
        markupPercent: 0,
        sellingPrice: 0,
        stock: 0,
      }])
      return
    }
    const combine = (o: ProductOption[]): { option: string; value: string }[][] => {
      if (o.length === 0) return [[]]
      const [first, ...rest] = o
      return first.values.flatMap((v) => combine(rest).map((c) => [{ option: first.name, value: v }, ...c]))
    }
    setVariants(combine(opts).map((attrs, i) => ({
      id: `var-${Date.now()}-${i}`,
      sku: generateSKU(productCode, attrs),
      barcode: generateBarcode(),
      attributes: attrs,
      costPrice: 0,
      markupPercent: 0,
      sellingPrice: 0,
      stock: 0,
    })))
  }, [productCode])

  const updateVariantField = (id: string, field: 'costPrice' | 'sellingPrice' | 'stock', value: number) => {
    setVariants((prev) => prev.map((v) => {
      if (v.id !== id) return v
      if (field === 'costPrice') {
        const selling = calculateSellingPrice(value, v.markupPercent)
        return { ...v, costPrice: value, sellingPrice: selling }
      }
      if (field === 'sellingPrice') {
        const markup = calculateMarkupFromSellingPrice(v.costPrice, value)
        return { ...v, sellingPrice: value, markupPercent: markup }
      }
      return { ...v, [field]: value }
    }))
  }



  // ── Suppliers ──
  const [linkedSuppliers, setLinkedSuppliers] = useState<LinkedSupplierEntry[]>([])
  const [selectSupId, setSelectSupId] = useState('')
  const [showAddSupModal, setShowAddSupModal] = useState(false)
  const [suppCodeInputs, setSuppCodeInputs] = useState<Record<string, string>>({})

  const appendLinkedSupplier = (supplierId: string) => {
    if (!supplierId || linkedSuppliers.find((l) => l.supplierId === supplierId)) return
    setLinkedSuppliers((prev) => [...prev, { supplierId, supplierCode: '', open: true }])
  }

  const linkSupplier = () => {
    appendLinkedSupplier(selectSupId)
    setSelectSupId('')
  }

  const unlinkSupplier = (id: string) => setLinkedSuppliers((prev) => prev.filter((l) => l.supplierId !== id))

  const toggleSupplierAccordion = (id: string) =>
    setLinkedSuppliers((prev) => prev.map((l) => l.supplierId === id ? { ...l, open: !l.open } : l))

  // ── Media ──
  const [mediaImages, setMediaImages] = useState<string[]>([])

  const simulateImageUpload = () => {
    const colors = ['#10b981', '#6ee7b7', '#34d399', '#a7f3d0', '#047857']
    const color = colors[mediaImages.length % colors.length]
    const svg = `data:image/svg+xml;base64,${btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="${color}"/><text x="100" y="110" font-family="Arial" font-size="14" fill="white" text-anchor="middle">Image ${mediaImages.length + 1}</text></svg>`)}`
    setMediaImages((prev) => [...prev, svg])
  }

  // ── Documents ──
  const [docFiles, setDocFiles] = useState<MockFile[]>([])

  const simulateDocUpload = () => {
    const f: MockFile = {
      id: `doc-${Date.now()}`,
      name: `Document_${docFiles.length + 1}.pdf`,
      size: Math.floor(Math.random() * 3000000) + 200000,
      type: 'application/pdf',
      tag: 'User Manual',
    }
    setDocFiles((prev) => [...prev, f])
  }

  const updateDocTag = (id: string, tag: DocFileTag) =>
    setDocFiles((prev) => prev.map((f) => f.id === id ? { ...f, tag } : f))

  const removeDoc = (id: string) => setDocFiles((prev) => prev.filter((f) => f.id !== id))

  // ── Status & Tags ──
  const [status, setStatus] = useState<'draft' | 'active' | 'inactive'>('draft')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) setTags((prev) => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  // ── Save ──
  const handleSave = (saveStatus: 'draft' | 'active') => {
    const product: Product = {
      id: `prod-${Date.now()}`,
      name: name || 'Untitled Product',
      productCode,
      productType: options.length > 0 ? 'variable' : 'simple',
      category,
      subcategory,
      brand: '',
      description,
      uom: 'Piece',
      status: saveStatus,
      supplierId: linkedSuppliers[0]?.supplierId ?? '',
      linkedSupplierIds: linkedSuppliers.map((l) => l.supplierId),
      options,
      variants,
      files: docFiles,
      mediaImages,
      tags,
      createdAt: new Date().toISOString(),
    }
    onSave(product)
    onBack()
  }

  return (
    <>
      {/* Modals */}
      {showNewCatModal === 'cat' && (
        <NewCategoryModal
          title="Add New Category"
          onSave={(val) => { setExtraCategories((p) => [...p, val]); setCategory(val) }}
          onClose={() => setShowNewCatModal(null)}
        />
      )}
      {showNewCatModal === 'sub' && category && (
        <NewCategoryModal
          title={`Add Subcategory to "${category}"`}
          onSave={(val) => {
            setExtraSubMap((p) => ({ ...p, [category]: [...(p[category] ?? []), val] }))
            setSubcategory(val)
          }}
          onClose={() => setShowNewCatModal(null)}
        />
      )}
      {showAddSupModal && (
        <AddSupplierModal
          onSave={(s) => {
            setSupplierPool((p) => [...p, s])
            onAddSupplier(s)
            appendLinkedSupplier(s.id)
          }}
          onClose={() => setShowAddSupModal(false)}
        />
      )}

      <div className="min-h-full bg-neutral-50">
        {/* Page header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-0.5">
                  <span>Inventory</span>
                  <span>/</span>
                  <span className="text-neutral-700 font-medium">Add New Product</span>
                </div>
                <h1 className="text-lg font-bold text-neutral-900 leading-none">Add New Product</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSave('draft')}
                className="h-9 px-4 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave('active')}
                className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Publish Product
              </button>
            </div>
          </div>
        </div>

        {/* Bento grid body */}
        <div className="px-6 py-6 max-w-[1400px] mx-auto">
          <div className="flex gap-5 items-start">
            {/* LEFT COLUMN — 70% */}
            <div className="flex-[7] min-w-0 space-y-4">

              {/* 1. General Information */}
              <BentoCard title="General Information">
                <div className="space-y-4">
                  <Field label="Product Name">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. ProElite Gaming Headset"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Product Description">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the product in detail…"
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    />
                  </Field>
                  <Field label="SKU">
                    <div className="relative">
                      <input
                        value="[ Auto-generated on save ]"
                        disabled
                        className="w-full h-9 px-3 pr-9 rounded-lg border border-neutral-200 text-sm text-neutral-400 bg-neutral-50 cursor-not-allowed font-mono"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300" />
                    </div>
                  </Field>
                </div>
              </BentoCard>

              {/* 2. Category & Subcategory */}
              <BentoCard title="Category">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category">
                    <div className="flex gap-1.5">
                      <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setSubcategory('') }}
                        className={cn(inputCls, 'flex-1')}
                      >
                        <option value="">Select category…</option>
                        {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button
                        onClick={() => setShowNewCatModal('cat')}
                        title="Add new category"
                        className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Field>
                  <Field label="Subcategory">
                    <div className="flex gap-1.5">
                      <select
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        disabled={!category}
                        className={cn(inputCls, 'flex-1 disabled:opacity-50 disabled:cursor-not-allowed')}
                      >
                        <option value="">Select subcategory…</option>
                        {allSubcats.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button
                        onClick={() => category && setShowNewCatModal('sub')}
                        disabled={!category}
                        title="Add new subcategory"
                        className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Field>
                </div>
              </BentoCard>

              {/* 3. Variant Builder */}
              <BentoCard title="Variant Builder">
                <div className="space-y-4">
                  {/* Per-row attribute editor */}
                  {draftRows.length > 0 && (
                    <div className="space-y-2">
                      {draftRows.map((row) => (
                        <div key={row.id} className="flex items-start gap-2">
                          {/* Combobox for attribute key */}
                          <div className="flex flex-col gap-0.5 w-40 shrink-0">
                            {draftRows.indexOf(row) === 0 && (
                              <span className="text-xs font-medium text-neutral-500 mb-0.5">Attribute</span>
                            )}
                            <AttributeCombobox
                              value={row.key}
                              onChange={(val) => updateDraftKeyCommit(row.id, val)}
                            />
                          </div>
                          {/* Multi-tag value input */}
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            {draftRows.indexOf(row) === 0 && (
                              <span className="text-xs font-medium text-neutral-500 mb-0.5">Values <span className="font-normal text-neutral-400">(Enter or , to add)</span></span>
                            )}
                            <ValueTagInput
                              values={row.values}
                              onChange={(vals) => updateDraftValues(row.id, vals)}
                            />
                          </div>
                          {/* Trash */}
                          <div className={draftRows.indexOf(row) === 0 ? 'mt-5' : ''}>
                            <button
                              onClick={() => removeDraftRow(row.id)}
                              className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add row button */}
                  <button
                    onClick={addDraftRow}
                    className="w-full h-9 rounded-lg border border-dashed border-neutral-300 hover:border-emerald-400 hover:bg-emerald-50/30 text-neutral-500 hover:text-emerald-600 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    + Add Variant Attribute
                  </button>

                  {/* Variant matrix */}
                  {variants.length > 0 && (
                    <div className="border border-neutral-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
                        <p className="text-xs font-semibold text-neutral-600">
                          Variant Matrix — {variants.length} combination{variants.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50/50">
                              <th className="text-left text-xs font-medium text-neutral-400 px-3 py-2 w-14">Thumb</th>
                              <th className="text-left text-xs font-medium text-neutral-400 px-3 py-2">Variant Name</th>
                              <th className="text-right text-xs font-medium text-neutral-400 px-3 py-2">Stock</th>
                              <th className="text-right text-xs font-medium text-neutral-400 px-3 py-2">Unit Cost ($)</th>
                              <th className="text-right text-xs font-medium text-neutral-400 px-3 py-2">Selling ($)</th>
                              <th className="text-right text-xs font-medium text-neutral-400 px-3 py-2">Markup %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((v) => {
                              const label = v.attributes.length > 0
                                ? `${name || 'Product'} - ${v.attributes.map((a) => a.value).join(' / ')}`
                                : name || 'Default Variant'
                              const markup = v.markupPercent
                              const isProfit = markup > 0

                              return (
                                <tr key={v.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                                  {/* Thumbnail slot */}
                                  <td className="px-3 py-2">
                                    <div
                                      className="w-10 h-10 rounded-lg border-2 border-dashed border-neutral-200 hover:border-emerald-400 cursor-pointer flex items-center justify-center bg-neutral-50 hover:bg-emerald-50/30 transition-all"
                                      title="Click to upload variant image"
                                    >
                                      {v.image ? (
                                        <img src={v.image} alt="" className="w-full h-full rounded-lg object-cover" />
                                      ) : (
                                        <ImageIcon className="w-3.5 h-3.5 text-neutral-300" />
                                      )}
                                    </div>
                                  </td>
                                  {/* Name */}
                                  <td className="px-3 py-2">
                                    <p className="text-xs font-medium text-neutral-800 leading-tight">{label}</p>
                                    <p className="text-xs font-mono text-neutral-400 mt-0.5">{v.sku}</p>
                                  </td>
                                  {/* Stock */}
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={v.stock || ''}
                                      onChange={(e) => updateVariantField(v.id, 'stock', parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                      className="w-16 h-7 px-2 rounded border border-neutral-200 text-xs text-right outline-none focus:ring-1 focus:ring-emerald-500 ml-auto block"
                                    />
                                  </td>
                                  {/* Cost */}
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={v.costPrice || ''}
                                      onChange={(e) => updateVariantField(v.id, 'costPrice', parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                      className="w-24 h-7 px-2 rounded border border-neutral-200 text-xs text-right outline-none focus:ring-1 focus:ring-emerald-500 ml-auto block"
                                    />
                                  </td>
                                  {/* Selling */}
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      value={v.sellingPrice || ''}
                                      onChange={(e) => updateVariantField(v.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                      className="w-24 h-7 px-2 rounded border border-emerald-200 text-xs text-right text-emerald-700 font-semibold outline-none focus:ring-1 focus:ring-emerald-500 ml-auto block bg-emerald-50/50"
                                    />
                                  </td>
                                  {/* Markup badge */}
                                  <td className="px-3 py-2">
                                    <div className={cn(
                                      'w-20 h-7 rounded flex items-center justify-end px-2 ml-auto text-xs font-bold',
                                      isProfit
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                                    )}>
                                      {markup > 0 ? `${markup.toFixed(1)}%` : '—'}
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </BentoCard>

              {/* 4. Supplier Network */}
              <BentoCard title="Supplier Network">
                <div className="space-y-4">
                  {/* Link toolbar */}
                  <div className="flex gap-2">
                    <select
                      value={selectSupId}
                      onChange={(e) => setSelectSupId(e.target.value)}
                      className={cn(inputCls, 'flex-1')}
                    >
                      <option value="">Select existing supplier…</option>
                      {supplierPool
                        .filter((s) => !linkedSuppliers.find((l) => l.supplierId === s.id))
                        .map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button
                      onClick={linkSupplier}
                      disabled={!selectSupId}
                      className="h-9 px-3 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50 shrink-0"
                    >
                      Link
                    </button>
                    <button
                      onClick={() => setShowAddSupModal(true)}
                      className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Link New Supplier
                    </button>
                  </div>

                  {linkedSuppliers.length === 0 && (
                    <div className="text-center py-6 text-neutral-400 text-sm border-2 border-dashed border-neutral-200 rounded-xl">
                      No suppliers linked yet. Select or add one above.
                    </div>
                  )}

                  {/* Supplier accordions */}
                  <div className="space-y-2">
                    {linkedSuppliers.map((linked) => {
                      const sup = supplierPool.find((s) => s.id === linked.supplierId)
                      if (!sup) return null
                      return (
                        <div key={linked.supplierId} className="border border-neutral-200 rounded-xl overflow-hidden">
                          <button
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
                            onClick={() => toggleSupplierAccordion(linked.supplierId)}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-neutral-800">{sup.name}</p>
                                <p className="text-xs text-neutral-400">{sup.paymentTerms} · {sup.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); unlinkSupplier(linked.supplierId) }}
                                className="w-6 h-6 rounded flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              {linked.open
                                ? <ChevronDown className="w-4 h-4 text-neutral-400" />
                                : <ChevronRight className="w-4 h-4 text-neutral-400" />}
                            </div>
                          </button>
                          {linked.open && (
                            <div className="px-4 pb-4 border-t border-neutral-100 bg-neutral-50/50">
                              <div className="grid grid-cols-2 gap-3 pt-3">
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Supplier Name</label>
                                  <input defaultValue={sup.name} className={inputCls} />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Supplier Code (Unique)</label>
                                  <input
                                    value={suppCodeInputs[linked.supplierId] ?? ''}
                                    onChange={(e) => setSuppCodeInputs((p) => ({ ...p, [linked.supplierId]: e.target.value }))}
                                    placeholder="e.g. SUP-001"
                                    className={inputCls}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">VAT Reg / TIN</label>
                                  <input defaultValue={sup.vatTin} className={inputCls} />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Contact Person</label>
                                  <input defaultValue={sup.contactPerson} className={inputCls} />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Email</label>
                                  <input defaultValue={sup.email} className={inputCls} />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Phone</label>
                                  <input defaultValue={sup.phone} className={inputCls} />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs text-neutral-500 mb-1">Street Address</label>
                                  <input defaultValue={sup.address} className={inputCls} />
                                </div>
                                <div>
                                  <label className="block text-xs text-neutral-500 mb-1">Payment Terms</label>
                                  <select defaultValue={sup.paymentTerms} className={inputCls}>
                                    {['Net 30', 'Net 60', 'Net 15', 'COD', 'Prepaid'].map((t) => <option key={t}>{t}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </BentoCard>
            </div>

            {/* RIGHT COLUMN — 30% */}
            <div className="flex-[3] min-w-0 space-y-4">

              {/* Media Gallery */}
              <BentoCard title="Media Gallery">
                <div className="space-y-3">
                  {/* Primary viewport */}
                  <div
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-neutral-200 hover:border-emerald-400 bg-neutral-50 hover:bg-emerald-50/20 flex items-center justify-center cursor-pointer transition-all overflow-hidden"
                    onClick={simulateImageUpload}
                  >
                    {mediaImages[0] ? (
                      <img src={mediaImages[0]} alt="Primary" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-neutral-300">
                        <Upload className="w-7 h-7" />
                        <p className="text-xs text-center">Click to upload<br />primary image</p>
                      </div>
                    )}
                  </div>
                  {/* Auxiliary slots */}
                  {mediaImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {mediaImages.slice(1).map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg border border-neutral-200 overflow-hidden relative group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setMediaImages((p) => p.filter((_, idx) => idx !== i + 1))}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={simulateImageUpload}
                        className="aspect-square rounded-lg border-2 border-dashed border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50/30 flex items-center justify-center transition-all text-neutral-300 hover:text-emerald-500"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {mediaImages.length === 0 && (
                    <button
                      onClick={simulateImageUpload}
                      className="w-full h-9 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Media
                    </button>
                  )}
                </div>
              </BentoCard>

              {/* Product Documentation */}
              <BentoCard title="Product Documentation">
                <div className="space-y-3">
                  <div
                    onClick={simulateDocUpload}
                    className="border-2 border-dashed border-neutral-200 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/20 transition-all"
                  >
                    <FileText className="w-6 h-6 text-neutral-300" />
                    <p className="text-xs text-neutral-400 text-center">Drop files or click to upload<br /><span className="text-neutral-300">PDF, DOCX, XLSX</span></p>
                  </div>
                  {docFiles.length > 0 && (
                    <div className="space-y-1.5">
                      {docFiles.map((f) => (
                        <div key={f.id} className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200">
                          <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-700 truncate">{f.name}</p>
                            <p className="text-xs text-neutral-400">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                          <select
                            value={f.tag ?? 'User Manual'}
                            onChange={(e) => updateDocTag(f.id, e.target.value as DocFileTag)}
                            className="text-xs border border-neutral-200 rounded px-1.5 py-0.5 bg-white outline-none focus:ring-1 focus:ring-emerald-500 shrink-0"
                          >
                            {DOC_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button onClick={() => removeDoc(f.id)} className="text-neutral-300 hover:text-red-500 transition-colors shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </BentoCard>

              {/* Status & Tags */}
              <BentoCard title="Status & Tags">
                <div className="space-y-4">
                  <Field label="Product Status">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'inactive')}
                      className={inputCls}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Archived</option>
                    </select>
                    <div className="mt-2">
                      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border capitalize', {
                        'bg-emerald-50 text-emerald-700 border-emerald-200': status === 'active',
                        'bg-amber-50 text-amber-700 border-amber-200': status === 'draft',
                        'bg-red-50 text-red-700 border-red-200': status === 'inactive',
                      })}>
                        {status === 'inactive' ? 'Archived' : status}
                      </span>
                    </div>
                  </Field>
                  <Field label="Product Tags">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.map((t) => (
                        <span key={t} className="flex items-center gap-1 text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full border border-neutral-200">
                          {t}
                          <button onClick={() => setTags((p) => p.filter((x) => x !== t))} className="text-neutral-400 hover:text-red-500 transition-colors">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Type tag and press Enter…"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </BentoCard>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
