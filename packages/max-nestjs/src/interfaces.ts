import { ModuleMetadata, Type } from '@nestjs/common'
import { Bot, Context, Middleware } from '@maxhub/max-bot-api'
import { SceneOptions } from './scenes'

/** Запись слушателя метода: имя метода composer'а + его аргументы. */
export interface ListenerMetadata {
  method: 'use' | 'on' | 'command' | 'hears' | 'action' | 'enter' | 'leave'
  args: unknown[]
}

export interface SceneMetadata {
  sceneId: string
  type: 'base' | 'wizard'
  options?: SceneOptions<Context>
}

export interface WizardStepMetadata {
  step: number
}

export interface MaxModuleOptions {
  token: string
  botName?: string
  /** Кастомный класс контекста (по умолчанию `WizardContext`). */
  contextType?: new (...args: ConstructorParameters<typeof Context>) => Context
  /** Ограничить сканирование указанными модулями. */
  include?: Function[]
  /** Дополнительные middleware, применяемые сразу после session. */
  middlewares?: ReadonlyArray<Middleware<Context>>
  /** Запускать ли polling (false для dev/тестов). */
  enable?: boolean
  /**
   * Имя HTTP-заголовка, из которого guard читает raw init data.
   * По умолчанию: `x-max-init-data`.
   */
  headerName?: string
}

export interface MaxOptionsFactory {
  createMaxOptions(): Promise<MaxModuleOptions> | MaxModuleOptions
}

export interface MaxModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  botName?: string
  useExisting?: Type<MaxOptionsFactory>
  useClass?: Type<MaxOptionsFactory>
  useFactory?: (...args: any[]) => Promise<MaxModuleOptions> | MaxModuleOptions
  inject?: any[]
}

export type MaxBot = Bot<Context>
