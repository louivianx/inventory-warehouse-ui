export type ProductType = 'simple' | 'variable'
export type ProductStatus = 'active' | 'draft' | 'inactive'
export type DocFileTag = 'User Manual' | 'Safety Certificate' | 'Warranty Guide' | 'Compliance' | 'Other'

export interface VariantAttribute {
  option: string
  value: string
}

export interface ProductVariant {
  id: string
  sku: string
  barcode: string
  attributes: VariantAttribute[]
  image?: string
  costPrice: number
  markupPercent: number
  sellingPrice: number
  stock: number
}

export interface ProductOption {
  id: string
  name: string
  values: string[]
}

export interface MockFile {
  id: string
  name: string
  size: number
  type: string
  tag?: DocFileTag
}

export interface LinkedSupplier {
  supplierId: string
  supplierCode: string
}

export interface Product {
  id: string
  name: string
  productCode: string
  productType: ProductType
  category: string
  subcategory: string
  brand: string
  description: string
  uom: string
  status: ProductStatus
  supplierId: string
  linkedSupplierIds: string[]
  options: ProductOption[]
  variants: ProductVariant[]
  files: MockFile[]
  mediaImages: string[]
  tags: string[]
  createdAt: string
}
