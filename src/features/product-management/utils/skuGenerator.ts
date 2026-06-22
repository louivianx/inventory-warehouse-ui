let skuCounter = 1000
let barcodeCounter = 8900000000000

export function generateSKU(productCode: string, attributes: { option: string; value: string }[]): string {
  const prefix = productCode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
  const attrPart = attributes
    .map((a) => a.value.replace(/\s+/g, '').toUpperCase().slice(0, 3))
    .join('-')
  const counter = String(++skuCounter).padStart(3, '0')
  return attrPart ? `${prefix}-${attrPart}-${counter}` : `${prefix}-DEF-${counter}`
}

export function generateBarcode(): string {
  return String(++barcodeCounter)
}
