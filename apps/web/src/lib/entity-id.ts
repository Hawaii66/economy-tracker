export function createEntityId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}
