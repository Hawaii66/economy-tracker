import type { SinkIcon } from '@/lib/sink-icons'

export type CategoryOption = { id: string; name: string; color: string }
export type SinkOption = { id: string; name: string; color: string; icon: SinkIcon; balance: number }
export type TagOption = {
  id: string
  name: string
  color: string
  kind: 'permanent' | 'temporary'
}

export type EditableTransaction = {
  id: string
  accountId: string
  date: string
  amount: number
  description: string
}
