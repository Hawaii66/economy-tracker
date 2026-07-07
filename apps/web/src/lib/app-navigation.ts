import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Import,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  Split,
  Tags,
  Wallet,
  Waves,
  Wand2,
} from 'lucide-react'

export type NavItem = {
  label: string
  icon: LucideIcon
  to: string
  exact?: boolean
}

export const globalNavItems: NavItem[] = [
  {
    label: 'Budgets',
    icon: LayoutGrid,
    to: '/dashboard',
    exact: true,
  },
]

export const budgetNavItems: NavItem[] = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    to: '/dashboard/budgets/$budgetId',
    exact: true,
  },
  {
    label: 'Sinks',
    icon: Waves,
    to: '/dashboard/budgets/$budgetId/sinks',
  },
  {
    label: 'Accounts',
    icon: Wallet,
    to: '/dashboard/budgets/$budgetId/accounts',
  },
  {
    label: 'Ledger',
    icon: BookOpen,
    to: '/dashboard/budgets/$budgetId/ledger',
  },
  {
    label: 'Import',
    icon: Import,
    to: '/dashboard/budgets/$budgetId/import',
  },
  {
    label: 'Splits',
    icon: Split,
    to: '/dashboard/budgets/$budgetId/splits',
  },
  {
    label: 'Categories & Tags',
    icon: Tags,
    to: '/dashboard/budgets/$budgetId/tags',
  },
  {
    label: 'Rules',
    icon: Wand2,
    to: '/dashboard/budgets/$budgetId/rules',
  },
  {
    label: 'Settings',
    icon: Settings,
    to: '/dashboard/budgets/$budgetId/settings',
  },
]

export const budgetNavGroups = [
  {
    label: 'Budgeting',
    items: budgetNavItems.slice(0, 2),
  },
  {
    label: 'Cash & Ledger',
    items: budgetNavItems.slice(2, 5),
  },
  {
    label: 'Organization',
    items: budgetNavItems.slice(5, 8),
  },
  {
    label: 'Workspace',
    items: budgetNavItems.slice(8),
  },
] as const
