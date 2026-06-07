import { Composer, Context, Middleware, MiddlewareFn } from '@maxhub/max-bot-api'

export interface SceneOptions<C extends Context> {
  ttl?: number
  handlers?: ReadonlyArray<Middleware<C>>
  enterHandlers?: ReadonlyArray<Middleware<C>>
  leaveHandlers?: ReadonlyArray<Middleware<C>>
}

/**
 * Базовая сцена — Composer с идентификатором и обработчиками входа/выхода.
 * Порт telegraf `scenes/base.ts` на @maxhub/max-bot-api.
 */
export class BaseScene<C extends Context = Context> extends Composer<C> {
  id: string
  ttl?: number
  enterHandler: MiddlewareFn<C>
  leaveHandler: MiddlewareFn<C>

  constructor(id: string, options?: SceneOptions<C>) {
    const opts: Required<Omit<SceneOptions<C>, 'ttl'>> & Pick<SceneOptions<C>, 'ttl'> = {
      handlers: [],
      enterHandlers: [],
      leaveHandlers: [],
      ...options
    }
    super(...opts.handlers)
    this.id = id
    this.ttl = opts.ttl
    this.enterHandler = Composer.compose([...opts.enterHandlers])
    this.leaveHandler = Composer.compose([...opts.leaveHandlers])
  }

  enter(...fns: Array<Middleware<C>>) {
    this.enterHandler = Composer.compose([this.enterHandler, ...fns])
    return this
  }

  leave(...fns: Array<Middleware<C>>) {
    this.leaveHandler = Composer.compose([this.leaveHandler, ...fns])
    return this
  }

  enterMiddleware(): MiddlewareFn<C> {
    return this.enterHandler
  }

  leaveMiddleware(): MiddlewareFn<C> {
    return this.leaveHandler
  }
}
