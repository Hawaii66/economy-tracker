import { DEFAULT_ENTITY_COLOR } from '@/lib/taxonomy'

export { DEFAULT_ENTITY_COLOR }

export const ACCOUNT_ICON_VALUES = [
  'wallet',
  'landmark',
  'credit-card',
  'piggy-bank',
  'banknote',
  'building-2',
  'circle-dollar-sign',
] as const

export type AccountIcon = (typeof ACCOUNT_ICON_VALUES)[number]

export const DEFAULT_ACCOUNT_ICON: AccountIcon = 'wallet'

export const ACCOUNT_ICON_OPTIONS = [
  { value: 'wallet' as const, label: 'Wallet' },
  { value: 'landmark' as const, label: 'Bank' },
  { value: 'credit-card' as const, label: 'Card' },
  { value: 'piggy-bank' as const, label: 'Savings' },
  { value: 'banknote' as const, label: 'Cash' },
  { value: 'building-2' as const, label: 'Institution' },
  { value: 'circle-dollar-sign' as const, label: 'Funds' },
] satisfies ReadonlyArray<{ value: AccountIcon; label: string }>

export function todayIsoDate(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}
