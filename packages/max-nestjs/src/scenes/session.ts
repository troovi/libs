import { Context, MiddlewareFn } from '@maxhub/max-bot-api'

/**
 * Хранилище сессий. По умолчанию используется in-memory `MemorySessionStore`,
 * но интерфейс позволяет подключить персистентное хранилище (например, Mongo).
 */
export interface SessionStore<T> {
  get(key: string): T | undefined | Promise<T | undefined>
  set(key: string, value: T): void | Promise<void>
  delete(key: string): void | Promise<void>
}

/** Простое in-memory хранилище сессий (Map). */
export class MemorySessionStore<T> implements SessionStore<T> {
  private readonly store = new Map<string, T>()

  get(key: string): T | undefined {
    return this.store.get(key)
  }

  set(key: string, value: T): void {
    this.store.set(key, value)
  }

  delete(key: string): void {
    this.store.delete(key)
  }
}

export interface SessionOptions<S, C extends Context> {
  /** Имя свойства контекста (по умолчанию `session`). */
  property?: string
  /** Ключ сессии. По умолчанию — id пользователя MAX. */
  getSessionKey?: (ctx: C) => string | undefined
  store?: SessionStore<S>
  defaultSession?: (ctx: C) => S
}

/**
 * Ключ сессии по умолчанию: id пользователя MAX (бот общается 1:1, поэтому
 * достаточно ключа по пользователю). Берём id из любого типа апдейта.
 */
export const getDefaultSessionKey = (ctx: Context): string | undefined => {
  const userId = ctx.user?.user_id ?? ctx.message?.sender?.user_id ?? ctx.callback?.user?.user_id

  return userId === undefined ? undefined : String(userId)
}

/**
 * Middleware, добавляющий `ctx.session` поверх произвольного хранилища.
 * Значение читается до выполнения цепочки и записывается обратно после неё.
 * Упрощённая версия telegraf-session: один процесс, низкая конкуренция.
 */
export function session<S extends object, C extends Context = Context>(
  options?: SessionOptions<S, C>
): MiddlewareFn<C> {
  const property = options?.property ?? 'session'
  const getSessionKey = options?.getSessionKey ?? getDefaultSessionKey
  const store = options?.store ?? new MemorySessionStore<S>()
  const defaultSession = options?.defaultSession ?? (() => ({}) as S)

  return async (ctx, next) => {
    const key = getSessionKey(ctx)

    if (!key) {
      return next()
    }

    let value = (await store.get(key)) ?? defaultSession(ctx)

    Object.defineProperty(ctx, property, {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: (next_: S) => {
        value = next_
      }
    })

    await next()

    if (value == null) {
      await store.delete(key)
    } else {
      await store.set(key, value)
    }
  }
}
