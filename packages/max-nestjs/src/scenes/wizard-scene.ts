import { Composer, MiddlewareFn } from '@maxhub/max-bot-api'
import { BaseScene, SceneOptions } from './base-scene'
import { WizardContextWizard, WizardSessionContext } from './wizard-context'

type WizardContext = WizardSessionContext & {
  wizard: WizardContextWizard<WizardSessionContext>
}

/**
 * Wizard-сцена: линейная последовательность шагов (`steps`), курсор по которым
 * хранит `ctx.wizard`. Порт telegraf `scenes/wizard/index.ts` без `Composer.unwrap`
 * (шаги уже скомпонованы в `MiddlewareFn`).
 */
export class WizardScene<C extends WizardContext = WizardContext> extends BaseScene<C> {
  steps: Array<MiddlewareFn<C>>

  constructor(id: string, ...steps: Array<MiddlewareFn<C>>)
  constructor(id: string, options: SceneOptions<C>, ...steps: Array<MiddlewareFn<C>>)
  constructor(
    id: string,
    options?: SceneOptions<C> | MiddlewareFn<C>,
    ...steps: Array<MiddlewareFn<C>>
  ) {
    let opts: SceneOptions<C> | undefined
    let resolvedSteps: Array<MiddlewareFn<C>>

    if (typeof options === 'function') {
      opts = undefined
      resolvedSteps = [options, ...steps]
    } else {
      opts = options
      resolvedSteps = steps
    }

    super(id, opts)
    this.steps = resolvedSteps
  }

  middleware(): MiddlewareFn<C> {
    return Composer.compose<C>([
      (ctx, next) => {
        ;(ctx as { wizard?: unknown }).wizard = new WizardContextWizard(ctx as never, this.steps)
        return next()
      },
      super.middleware(),
      (ctx, next) => {
        if (ctx.wizard.step === undefined) {
          ctx.wizard.selectStep(0)
          return ctx.scene.leave()
        }
        return ctx.wizard.step(ctx, next)
      }
    ])
  }

  enterMiddleware(): MiddlewareFn<C> {
    return Composer.compose<C>([this.enterHandler, this.middleware()])
  }
}
