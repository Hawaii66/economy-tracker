export type CategoryOption = { id: string; name: string; color: string }
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
