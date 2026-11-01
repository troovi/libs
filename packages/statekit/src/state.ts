/** Источник значения: чтение без подписки и подписка на изменения. */
export interface Source<T> {
  get: () => T
  /** Подписка на изменения; возвращает отписку. */
  subscribe: (listener: () => void) => () => void
}

/** Ячейка состояния: значение, его замена и правка от прежнего. */
export interface State<T> extends Source<T> {
  set: (value: T) => void
  update: (change: (value: T) => T) => void
}

/** Пакет записей: пока он открыт, уведомления копятся и уходят по одному на подписчика в конце. */
const batching = { depth: 0, pending: new Set<() => void>() }

const notify = (listener: () => void) => {
  if (batching.depth > 0) {
    batching.pending.add(listener)
    return
  }

  listener()
}

/**
 * Несколько записей одним уведомлением: подписчик не видит промежуточного состояния, а подписанный на несколько
 * ячеек узнаёт об изменении один раз. Пакеты вкладываются — уведомления уходят, когда закрывается внешний; записи,
 * сделанные до ошибки в `run`, тоже.
 */
export const batch = (run: () => void) => {
  batching.depth += 1

  try {
    run()
  } finally {
    batching.depth -= 1

    if (batching.depth === 0) {
      const listeners = [...batching.pending]

      batching.pending.clear()
      listeners.forEach((listener) => listener())
    }
  }
}

/**
 * Ячейка состояния вне React: значение заменяется целиком, подписчики узнают о каждой замене; та же ссылка — не
 * изменение. Экран заводит ячейку на часть состояния, которую правят независимо и целиком: список, объект условий,
 * выбор.
 */
export const createState = <T>(initial: T): State<T> => {
  const listeners = new Set<() => void>()
  const cell = { value: initial }

  const set = (value: T) => {
    if (value === cell.value) {
      return
    }

    cell.value = value
    listeners.forEach(notify)
  }

  return {
    get: () => {
      return cell.value
    },
    set,
    update: (change) => {
      set(change(cell.value))
    },
    subscribe: (listener) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    }
  }
}
