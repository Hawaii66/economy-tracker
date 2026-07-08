export const DEFAULT_ENTITY_COLOR = '#5EAEFF'

export const TAXONOMY_COLOR_PRESETS = [
  '#5EAEFF',
  '#2E7AD4',
  '#1E5A9E',
  '#5BA3D4',
  '#4EC9B0',
  '#6BCB9A',
  '#84B88A',
  '#A8C86E',
  '#E8B84A',
  '#E8C04A',
  '#E8956A',
  '#C47A5A',
  '#E88A8A',
  '#C44747',
  '#D45B9A',
  '#B88AE8',
  '#9B7AE8',
  '#8C847E',
  '#D4B896',
  '#F2EFEA',
] as const

export function generateEntityId(): string {
  return crypto.randomUUID()
}

export function truncateId(id: string, length = 8): string {
  return id.length <= length ? id : `${id.slice(0, length)}…`
}
