export const DEFAULT_ENTITY_COLOR = '#5EAEFF'

export const TAXONOMY_COLOR_PRESETS = [
  '#5EAEFF',
  '#2E7AD4',
  '#6BCB9A',
  '#E8B84A',
  '#E88A8A',
  '#B88AE8',
  '#8C847E',
  '#F2EFEA',
] as const

export function generateEntityId(): string {
  return crypto.randomUUID()
}

export function truncateId(id: string, length = 8): string {
  return id.length <= length ? id : `${id.slice(0, length)}…`
}
