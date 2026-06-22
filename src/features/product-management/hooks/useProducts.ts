import { useState, useCallback } from 'react'
import type { Product } from '@/types/product.types'
import type { Supplier } from '@/types/supplier.types'
import { mockProducts, mockSuppliers } from '../data/mockData'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [...prev, product])
  }, [])

  const updateProduct = useCallback((updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addSupplier = useCallback((supplier: Supplier) => {
    setSuppliers((prev) => [...prev, supplier])
  }, [])

  const getSupplierById = useCallback(
    (id: string) => suppliers.find((s) => s.id === id),
    [suppliers]
  )

  return { products, suppliers, addProduct, updateProduct, deleteProduct, addSupplier, getSupplierById }
}
