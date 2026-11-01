import { useRef, useSyncExternalStore } from 'react'
import { Source } from './state'

type Equal<S> = (prev: S, next: S) => boolean

interface WatchOptions<S> {
  /** Равенство выбранного; по умолчанию — та же ссылка. Объект и массив из селектора — `shallow`. */
  equal?: Equal<S>
}

interface Selection<T, S> {
  value: T
  select?: (value: T) => S
  selected: unknown
}

/** Подписка компонента на источник целиком. */
export function useWatch<T>(source: Source<T>): T
/**
 * Подписка на часть источника: перерисовка — только когда выбранное изменилось по `equal`. Подписка изолирует только
 * компонент, который её держит: перерисованный компонент перерисует и всех своих детей, поэтому её ставят в лист.
 *
 * ```ts
 * const code = useWatch(points, (list) => pointOf(list, pointId).code)
 * const ids = useWatch(points, (list) => list.map((point) => point.pointId), { equal: shallow })
 * ```
 */
export function useWatch<T, S>(source: Source<T>, select: (value: T) => S, opts?: WatchOptions<S>): S
// prettier-ignore
export function useWatch<T, S>(source: Source<T>, select?: (value: T) => S, opts: WatchOptions<S> = {}) {
  const { equal = Object.is } = opts

  const cache = useRef<Selection<T, S> | null>(null)

  // React зовёт снимок и в рендере, и на каждое уведомление: кеш держит одну ссылку, пока выбранное не изменилось
  const getSelected = () => {
    const value = source.get()
    const prev = cache.current

    if (prev && prev.value === value && prev.select === select) {
      return prev.selected
    }

    const next = select ? select(value) : value
    // равное прежнему остаётся прежней ссылкой: React не перерисует компонент
    const selected = prev && equal(prev.selected as S, next as S) ? prev.selected : next

    cache.current = { value, select, selected }

    return selected
  }

  return useSyncExternalStore(source.subscribe, getSelected)
}

/** Поверхностное равенство объектов и массивов: те же ключи с теми же ссылками. */
export const shallow = <T extends object>(prev: T, next: T) => {
  if (Object.keys(prev).length !== Object.keys(next).length) {
    return false
  }

  for (const key in prev) {
    if (prev[key] !== next[key]) {
      return false
    }
  }

  return true
}
