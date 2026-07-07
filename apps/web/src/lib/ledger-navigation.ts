export type LedgerHighlightTarget = {
  type: 'raw' | 'ledger'
  id: string
}

export function ledgerRowId(type: 'raw' | 'ledger', id: string): string {
  return `ledger-row-${type}-${id}`
}

export function navigateToLedgerRow(type: 'raw' | 'ledger', id: string): LedgerHighlightTarget {
  const target = { type, id }
  requestAnimationFrame(() => {
    document.getElementById(ledgerRowId(type, id))?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
  return target
}
