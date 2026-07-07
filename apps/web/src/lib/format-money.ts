export function formatMoney(amount: number, currency = 'SEK'): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency,
    signDisplay: 'exceptZero',
  }).format(amount)
}
