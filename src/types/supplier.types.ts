export interface Supplier {
  id: string
  name: string
  vatTin: string
  contactPerson: string
  email: string
  phone: string
  address: string
  paymentTerms: string
  status: 'active' | 'inactive'
}
