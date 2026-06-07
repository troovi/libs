import { Composer, Context, MiddlewareFn } from '@maxhub/max-bot-api'
import { BaseScene } from './base-scene'
import { SceneContextScene, SceneContextSceneOptions, SceneSessionData } from './scene-context'

/**
 * Реестр сцен. В отличие от telegraf-Stage middleware разбит на две фазы, чтобы
 * обработчики `@Update` (команды) могли выполняться между ними и иметь приоритет
 * над шагами сцены: `attachMiddleware` (создаёт `ctx.scene`) → команды →
 * `executeMiddleware` (запускает текущую сцену). У @maxhub/max-bot-api нет
 * `Composer.lazy/optional/unwrap`, поэтому диспетчеризация сделана вручную.
 *
 * Тип сцены `ctx.scene` обеспечивается подклассом контекста (см. `SceneContext`/
 * `WizardContext`), поэтому здесь generic'и намеренно ослаблены (как `Stage<any>`
 * в nestjs-telegraf).
 */
export class Stage<
  C extends Context = Context,
  D extends SceneSessionData = SceneSessionData
> extends Composer<C> {
  options: Partial<SceneContextSceneOptions<D>>
  scenes: Map<string, BaseScene<C>>

  constructor(
    scenes: ReadonlyArray<BaseScene<C>> = [],
    options?: Partial<SceneContextSceneOptions<D>>
  ) {
    super()
    this.options = { ...options }
    this.scenes = new Map<string, BaseScene<C>>()
    scenes.forEach((scene) => this.register(scene))
  }

  register(...scenes: ReadonlyArray<BaseScene<C>>) {
    scenes.forEach((scene) => {
      if (scene?.id == null || typeof scene.middleware !== 'function') {
        throw new Error('max-bot-nestjs: unsupported scene')
      }
      this.scenes.set(scene.id, scene)
    })
    return this
  }

  /** Фаза 1: привязывает `ctx.scene`. Должна выполняться раньше обработчиков. */
  attachMiddleware(): MiddlewareFn<C> {
    return (ctx, next) => {
      const scene = new SceneContextScene(ctx as never, this.scenes as never, this.options)
      ;(ctx as { scene?: unknown }).scene = scene
      return next()
    }
  }

  /** Фаза 2: выполняет зарегистрированные composer'ы и текущую сцену. */
  executeMiddleware(): MiddlewareFn<C> {
    return Composer.compose<C>([
      super.middleware(),
      (ctx, next) => {
        const current = (ctx as unknown as { scene: SceneContextScene<never> }).scene.current
        return current ? current.middleware()(ctx as never, next) : next()
      }
    ])
  }

  /** Полный middleware (обе фазы подряд) — для простых случаев. */
  middleware(): MiddlewareFn<C> {
    return Composer.compose<C>([this.attachMiddleware(), this.executeMiddleware()])
  }

  static enter<C extends Context & { scene: SceneContextScene<never> }>(
    sceneId: string,
    initialState?: object,
    silent?: boolean
  ) {
    return (ctx: C) => ctx.scene.enter(sceneId, initialState, silent)
  }

  static leave<C extends Context & { scene: SceneContextScene<never> }>() {
    return (ctx: C) => ctx.scene.leave()
  }

  static reenter<C extends Context & { scene: SceneContextScene<never> }>() {
    return (ctx: C) => ctx.scene.reenter()
  }
}
