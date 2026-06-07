import { Context } from '@maxhub/max-bot-api'
import { SceneContextScene, SceneSession, SceneSessionData } from './scene-context'
import { WizardContextWizard, WizardSession, WizardSessionData } from './wizard-context'

/**
 * Контекст со сценами. Свойства проставляются middleware'ами (`session`/`scene`),
 * поэтому объявлены через `declare` (без runtime-инициализации).
 */
export class SceneContext<D extends SceneSessionData = SceneSessionData> extends Context {
  declare session?: SceneSession<D>
  declare scene: SceneContextScene<any, D>
}

/** Контекст wizard-сцены: добавляет `ctx.wizard` поверх сцен. */
export class WizardContext<D extends WizardSessionData = WizardSessionData> extends Context {
  declare session?: WizardSession<D>
  declare scene: SceneContextScene<any, D>
  declare wizard: WizardContextWizard<any>
}
