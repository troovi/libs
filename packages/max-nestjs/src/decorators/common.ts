import { Inject, SetMetadata } from '@nestjs/common'
import { Context } from '@maxhub/max-bot-api'
import {
  COMPOSER_METADATA,
  MaxParamtype,
  SCENE_METADATA,
  UPDATE_METADATA,
  WIZARD_STEP_METADATA
} from '../constants'
import { SceneMetadata, WizardStepMetadata } from '../interfaces'
import { SceneOptions } from '../scenes'
import { createListenerDecorator, createParamDecorator, getBotToken } from '../utils'
import { UpdateType } from '@maxhub/max-bot-api/dist/core/network/api'

// ── Классы ───────────────────────────────────────────────────────────────────

/** Класс-обработчик апдейтов (аналог `@Controller`). Регистрируется на боте. */
export const Update = (): ClassDecorator => SetMetadata(UPDATE_METADATA, true)

/** Класс-обработчик отдельного composer'а; добавляется в Stage до сцен. */
export const MaxComposer = (): ClassDecorator => SetMetadata(COMPOSER_METADATA, true)

/** Базовая сцена. */
export const Scene = (sceneId: string, options?: SceneOptions<Context>): ClassDecorator =>
  SetMetadata<string, SceneMetadata>(SCENE_METADATA, { sceneId, type: 'base', options })

/** Wizard-сцена (пошаговый диалог). */
export const Wizard = (sceneId: string, options?: SceneOptions<Context>): ClassDecorator =>
  SetMetadata<string, SceneMetadata>(SCENE_METADATA, { sceneId, type: 'wizard', options })

/** Инжект бота по имени. */
export const InjectBot = (botName?: string): ParameterDecorator => Inject(getBotToken(botName))

// ── Слушатели методов ────────────────────────────────────────────────────────

export const Use = createListenerDecorator('use')
export const On = createListenerDecorator<UpdateType>('on')
export const Command = createListenerDecorator('command')
export const Hears = createListenerDecorator('hears')
export const Action = createListenerDecorator('action')

/** Обработчик входа в сцену. */
export const SceneEnter = createListenerDecorator('enter')
/** Обработчик выхода из сцены. */
export const SceneLeave = createListenerDecorator('leave')

/** Шаг wizard-сцены (нумерация с 0). */
export const WizardStep = (step: number): MethodDecorator =>
  SetMetadata<string, WizardStepMetadata>(WIZARD_STEP_METADATA, { step })

// ── Параметры ────────────────────────────────────────────────────────────────

export const Ctx = createParamDecorator(MaxParamtype.CONTEXT)
export const Next = createParamDecorator(MaxParamtype.NEXT)
export const Sender = createParamDecorator(MaxParamtype.SENDER)
export const Message = createParamDecorator(MaxParamtype.MESSAGE)
export const Payload = createParamDecorator(MaxParamtype.PAYLOAD)
