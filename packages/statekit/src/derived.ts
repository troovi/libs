import { Source } from './state'

/** Значения источников по порядку: `[State<A>, State<B>]` → `[A, B]`. */
type Values<D extends readonly Source<unknown>[]> = {
  [K in keyof D]: D[K] extends Source<infer V> ? V : never
}

/**
 * Производная ячейка: `compute` считает по значениям `deps`. Пересчёт — при чтении и только когда хоть один источник
 * сменил значение; результат один на всех подписчиков. Подписка — на все источники. Производная — источник, как любой
 * другой: на неё подписываются `useWatch` и из неё строят следующие.
 *
 * ```ts
 * const calc = createDerived([points, rates], ([points, rates]) => calcOf(points, rates))
 * ```
 */
// prettier-ignore
export const createDerived = <const D extends readonly Source<unknown>[], R>(deps: D, compute: (values: Values<D>) => R): Source<R> => {
  const cache: { last: { values: unknown[]; result: R } | null } = { last: null }

  return {
    get: () => {
      const values = deps.map((dep) => dep.get())
      const { last } = cache

      if (last && values.every((value, i) => value === last.values[i])) {
        return last.result
      }

      const result = compute(values as Values<D>)

      cache.last = { values, result }

      return result
    },
    subscribe: (listener) => {
      const unsubscribes = deps.map((dep) => dep.subscribe(listener))

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe())
      }
    }
  }
}
