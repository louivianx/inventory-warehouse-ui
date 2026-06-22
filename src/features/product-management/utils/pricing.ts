export function calculateSellingPrice(cost: number, markupPercent: number): number {
  return cost * (1 + markupPercent / 100)
}

export function calculateMarkupFromSellingPrice(cost: number, sellingPrice: number): number {
  if (cost === 0) return 0
  return ((sellingPrice - cost) / cost) * 100
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPriceRange(prices: number[]): string {
  if (prices.length === 0) return '—'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return formatCurrency(min)
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}
