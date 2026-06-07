import { Context } from '@maxhub/max-bot-api'
import { BaseScene } from './base-scene'

const noop = () => Promise.resolve()
const now = () => Math.floor(Date.now() / 1000)

export interface SceneSessionData {
  current?: string
  expires?: number
  state?: object
}

export interface SceneSession<S extends SceneSessionData = SceneSessionData> {
  __scenes?: S
}

/** Контекст, у которого есть сессия со сценами (привязывается session middleware). */
export type SceneSessionContext<D extends SceneSessionData = SceneSessionData> = Context & {
  session?: SceneSession<D>
}

export interface SceneContextSceneOptions<D extends SceneSessionData> {
  ttl?: number
  default?: string
  defaultSession: D
}

/**
 * `ctx.scene` — управление текущей сценой пользователя. Состояние хранится в
 * `ctx.session.__scenes`. Порт telegraf `scenes/context.ts`.
 */
export class SceneContextScene<
  C extends SceneSessionContext<D>,
  D extends SceneSessionData = SceneSessionData
> {
  private readonly options: SceneContextSceneOptions<D>

  constructor(
    private readonly ctx: C,
    private readonly scenes: Map<string, BaseScene<C>>,
    options: Partial<SceneContextSceneOptions<D>>
  ) {
    const fallbackSessionDefault = {} as D

    this.options = { defaultSession: fallbackSessionDefault, ...options }
  }

  get session(): D {
    const defaultSession = Object.assign({}, this.options.defaultSession)

    let session = this.ctx.session?.__scenes ?? defaultSession

    if (session.expires !== undefined && session.expires < now()) {
      session = defaultSession
    }

    if (this.ctx.session === undefined) {
      this.ctx.session = { __scenes: session }
    } else {
      this.ctx.session.__scenes = session
    }

    return session
  }

  get state(): object {
    return (this.session.state ??= {})
  }

  set state(value: object) {
    this.session.state = { ...value }
  }

  get current(): BaseScene<C> | undefined {
    const sceneId = this.session.current ?? this.options.default

    return sceneId === undefined || !this.scenes.has(sceneId)
      ? undefined
      : this.scenes.get(sceneId)
  }

  reset() {
    if (this.ctx.session !== undefined) {
      this.ctx.session.__scenes = Object.assign({}, this.options.defaultSession)
    }
  }

  async enter(sceneId: string, initialState: object = {}, silent = false) {
    if (!this.scenes.has(sceneId)) {
      throw new Error(`max-bot-nestjs: can't find scene: ${sceneId}`)
    }

    if (!silent) {
      await this.leave()
    }

    this.session.current = sceneId
    this.state = initialState

    const ttl = this.current?.ttl ?? this.options.ttl
    if (ttl !== undefined) {
      this.session.expires = now() + ttl
    }

    if (this.current === undefined || silent) {
      return
    }

    const handler =
      'enterMiddleware' in this.current && typeof this.current.enterMiddleware === 'function'
        ? this.current.enterMiddleware()
        : this.current.middleware()

    return await handler(this.ctx, noop)
  }

  reenter() {
    return this.session.current === undefined
      ? undefined
      : this.enter(this.session.current, this.state)
  }

  private leaving = false
  async leave() {
    if (this.leaving) return

    try {
      this.leaving = true

      if (this.current === undefined) {
        return
      }

      const handler =
        'leaveMiddleware' in this.current && typeof this.current.leaveMiddleware === 'function'
          ? this.current.leaveMiddleware()
          : noop

      await handler(this.ctx, noop)

      return this.reset()
    } finally {
      this.leaving = false
    }
  }
}
