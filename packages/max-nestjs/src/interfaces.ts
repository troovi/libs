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
   * Регистрировать ли модуль как глобальный. По умолчанию `true` (одиночный
   * бот). Для нескольких ботов в одном приложении ставьте `false`, чтобы
   * внутренние токены (MAX_STAGE/MAX_MODULE_OPTIONS/MAX_BOT_NAME) не
   * конфликтовали между регистрациями.
   */
  global?: boolean
  /**
   * Имя HTTP-заголовка, из которого guard читает raw init data.
   * По умолчанию: `x-max-init-data`.
   */
  headerName?: string
  /**
   * Максимальный возраст `auth_date` init data, секунды: данные запуска старше отклоняются. Документация MAX срок
   * не задаёт, поэтому по умолчанию возраст не проверяется.
   */
  maxAgeSeconds?: number
  /**
   * Хранилище маркера long polling — провайдер приложения: модуль берёт его из контейнера. С ним опрос начинается с
   * сохранённого маркера, обновления пачки обрабатываются по очереди, маркер сохраняется после обработки пачки — так
   * после перезапуска приходит всё, что пришло за простой (без маркера MAX отдаёт только последнее обновление). Без
   * хранилища — `bot.start()`: маркер в памяти.
   */
  markerStore?: Type<MaxMarkerStore>
}

/**
 * Хранилище маркера long polling: докуда приложение обработало обновления. Сохраняется после обработки пачки, поэтому
 * сбой посреди пачки повторит её после перезапуска — повтор приложение отсекает само (например, по `body.mid`).
 */
export interface MaxMarkerStore {
  /** Сохранённый маркер; `null` — опрос ещё не шёл. */
  load(): Promise<number | null>
  save(marker: number): Promise<void>
}

export interface MaxOptionsFactory {
  createMaxOptions(): Promise<MaxModuleOptions> | MaxModuleOptions
}

export interface MaxModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  botName?: string
  /** См. `MaxModuleOptions.global`. По умолчанию `true`. */
  global?: boolean
  useExisting?: Type<MaxOptionsFactory>
  useClass?: Type<MaxOptionsFactory>
  useFactory?: (...args: any[]) => Promise<MaxModuleOptions> | MaxModuleOptions
  inject?: any[]
}

export type MaxBot = Bot<Context>
