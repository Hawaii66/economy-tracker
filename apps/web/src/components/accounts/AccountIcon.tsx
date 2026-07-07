import {
  Banknote,
  Building2,
  CircleDollarSign,
  CreditCard,
  Landmark,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { DEFAULT_ACCOUNT_ICON, type AccountIcon as AccountIconName } from '@/lib/accounts'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<AccountIconName, LucideIcon> = {
  wallet: Wallet,
  landmark: Landmark,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  banknote: Banknote,
  'building-2': Building2,
  'circle-dollar-sign': CircleDollarSign,
}

type AccountIconProps = {
  icon: AccountIconName
  className?: string
}

export function AccountIcon({ icon, className }: AccountIconProps) {
  const Icon = ICON_MAP[icon] ?? ICON_MAP[DEFAULT_ACCOUNT_ICON]
  return <Icon className={cn('size-5', className)} aria-hidden />
}
