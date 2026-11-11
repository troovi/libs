import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Bot, Context } from '@maxhub/max-bot-api'
import { MAX_BOT_NAME, MAX_MODULE_OPTIONS } from './constants'
import { MaxModuleOptions } from './interfaces'
import { WizardContext } from './scenes'
import { MaxUpdate } from './types'

const formatError = (error: unknown) => {
  return error instanceof Error ? (error.stack ?? error.message) : String(error)
}

/**
 * Ошибка обработчика обновления — в лог. Отказ guard'а (`CanActivate` → false) бросает `ForbiddenException`:
 * пользователю уже ответил сам guard, шуметь в лог не нужно.
 */
export const reportUpdateError = (error: unknown) => {
  if (error instanceof ForbiddenException) {
    return
  }

  Logger.error(formatError(error), 'MaxBot')
}

/**
 * Обработка одного обновления цепочкой middleware бота — та же, что у опроса и webhook: контекст обновления, сцены,
 * обработчики `@Update`. Ошибка обработчика остаётся в логе и наружу не выходит. Нужна опросу с хранилищем маркера и
 * приложению, которое получает обновления само (свой webhook, проверка на стенде).
 */
@Injectable()
export class MaxUpdateHandler {
  constructor(
    @Inject(MAX_BOT_NAME) private readonly botName: string,
    @Inject(MAX_MODULE_OPTIONS) private readonly options: MaxModuleOptions,
    private readonly moduleRef: ModuleRef
  ) {}

  async handle(update: MaxUpdate) {
    const bot = this.moduleRef.get<Bot<Context>>(this.botName, { strict: false })
    const ContextType = this.options.contextType ?? WizardContext
    const ctx = new ContextType(update, bot.api, bot.botInfo)

    try {
      await bot.middleware()(ctx, () => Promise.resolve())
    } catch (error) {
      reportUpdateError(error)
    }
  }
}
