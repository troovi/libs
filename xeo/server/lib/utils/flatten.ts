import { isPlainObject } from '@companix/utils-js'

export const buildFlattenMap = (filter: object): Record<string, unknown> => {
  const out: Record<string, unknown> = {}

  const walk = (node: unknown, prefix: string) => {
    if (node === undefined) {
      return
    }

    if (node === null || typeof node !== 'object' || Array.isArray(node) || !isPlainObject(node)) {
      if (prefix !== '') {
        out[prefix] = node
      }

      return
    }

    const keys = Object.keys(node)

    if (keys.length === 0) {
      if (prefix !== '') {
        out[prefix] = node
      }

      return
    }

    for (const key of keys) {
      const path = prefix ? `${prefix}.${key}` : key

      walk((node as Record<string, unknown>)[key], path)
    }
  }

  walk(filter, '')

  return out
}
