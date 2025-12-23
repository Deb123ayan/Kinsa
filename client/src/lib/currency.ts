export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatPriceWithUnit(amount: number, unit: string): string {
  return `₹${amount.toLocaleString('en-IN')}/${unit}`;
}
