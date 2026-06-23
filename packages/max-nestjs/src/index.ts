// Публичный API мини-фреймворка сцен/wizard для @maxhub/max-bot-api.
export * from './scenes'
export * from './decorators'
export * from './guards/auth.guard'
export * from './interfaces'
export { MaxCoreModule } from './max.module'
export { MAX_BOT_NAME, MAX_STAGE, MAX_MODULE_OPTIONS, MaxParamtype } from './constants'
export { getBotToken } from './utils'
export { MaxParamsFactory } from './params.factory'
export { MaxExecutionContext, MaxArgumentsHost } from './execution-context'
export type { MaxContextType } from './execution-context'
export { MetadataAccessorService, ListenersExplorerService, BaseExplorerService } from './services'
export * from './types'

// Реэкспорт ходовых сущностей @maxhub/max-bot-api, чтобы приложения работали
// только через max-nestjs и не импортировали базовую библиотеку напрямую.
export { Bot, Context, Composer, Api, Keyboard, MaxError } from '@maxhub/max-bot-api'
export type { FilteredContext, Middleware, MiddlewareFn, NextFn } from '@maxhub/max-bot-api'
