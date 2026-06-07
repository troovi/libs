import { Context, MiddlewareFn } from '@maxhub/max-bot-api'
import { SceneContextScene, SceneSession, SceneSessionData } from './scene-context'

export interface WizardSessionData extends SceneSessionData {
  cursor: number
}

export interface WizardSession<S extends WizardSessionData = WizardSessionData>
  extends SceneSession<S> {}

/** Контекст wizard-сцены: сессия со сценами + доступ к текущей сцене. */
export type WizardSessionContext = Context & {
  session?: WizardSession
  scene: SceneContextScene<WizardSessionContext, WizardSessionData>
}

/**
 * `ctx.wizard` — курсор по шагам wizard-сцены. Курсор хранится в
 * `ctx.scene.session.cursor`. Порт telegraf `scenes/wizard/context.ts`.
 */
export class WizardContextWizard<C extends WizardSessionContext = WizardSessionContext> {
  readonly state: object

  constructor(
    private readonly ctx: C,
    private readonly steps: ReadonlyArray<MiddlewareFn<C>>
  ) {
    this.state = ctx.scene.state
    this.cursor = ctx.scene.session.cursor ?? 0
  }

  get step(): MiddlewareFn<C> | undefined {
    return this.steps[this.cursor]
  }

  get cursor(): number {
    return this.ctx.scene.session.cursor
  }

  set cursor(cursor: number) {
    this.ctx.scene.session.cursor = cursor
  }

  selectStep(index: number) {
    this.cursor = index
    return this
  }

  next() {
    return this.selectStep(this.cursor + 1)
  }

  back() {
    return this.selectStep(this.cursor - 1)
  }
}
