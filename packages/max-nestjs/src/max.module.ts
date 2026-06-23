import {
  DynamicModule,
  ForbiddenException,
  Inject,
  Logger,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Provider,
  Type
} from '@nestjs/common'
import { DiscoveryModule, ModuleRef } from '@nestjs/core'
import { Bot, Context } from '@maxhub/max-bot-api'
import { MAX_BOT_NAME, MAX_MODULE_OPTIONS, MAX_STAGE } from './constants'
import { MaxModuleAsyncOptions, MaxModuleOptions, MaxOptionsFactory } from './interfaces'
import { ListenersExplorerService, MetadataAccessorService } from './services'
import { Stage, WizardContext, session } from './scenes'
import { getBotToken } from './utils'
import { MaxAuthGuard } from './guards/auth.guard'
import { MaxValidationService } from './validation'

const RETRY_BASE_MS = 5000
const RETRY_MAX_MS = 60000

const formatError = (error: unknown) =>
  error instanceof Error ? error.stack ?? error.message : String(error)

/**
 * Корневой модуль мини-фреймворка сцен/wizard для @maxhub/max-bot-api.
 * Аналог `TelegrafModule` из nestjs-telegraf.
 *
 * Globality управляется опцией `global` (по умолчанию `true` — обратная
 * совместимость с одиночным ботом). Для нескольких ботов в одном приложении
 * регистрируйте каждый `forRoot` с `global: false` и собственным `botName` —
 * тогда токены MAX_STAGE/MAX_MODULE_OPTIONS/MAX_BOT_NAME остаются локальными для
 * каждого модуля и не конфликтуют между ботами.
 */
@Module({
  imports: [DiscoveryModule],
  providers: [ListenersExplorerService, MetadataAccessorService]
})
export class MaxCoreModule implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(MaxCoreModule.name)
  private isStopping = false
  private bot?: Bot<Context>

  constructor(
    @Inject(MAX_BOT_NAME) private readonly botName: string,
    @Inject(MAX_MODULE_OPTIONS) private readonly options: MaxModuleOptions,
    private readonly moduleRef: ModuleRef
  ) {}

  static forRoot(options: MaxModuleOptions): DynamicModule {
    // Пустой токен больше не валит приложение: бот регистрируется, но polling
    // отключается. Удобно для нескольких ботов, когда часть токенов не задана.
    const enable = !!options.enable && !!options.token?.trim()

    if (!options.token?.trim()) {
      new Logger(MaxCoreModule.name).warn(
        `MAX bot "${options.botName ?? 'default'}" token is empty — polling disabled`
      )
    }

    const resolved: MaxModuleOptions = { ...options, enable }

    return {
      module: MaxCoreModule,
      global: options.global ?? true,
      providers: [
        { provide: MAX_MODULE_OPTIONS, useValue: resolved },
        ...this.coreProviders(getBotToken(resolved.botName)),
        MaxValidationService,
        MaxAuthGuard
      ],
      exports: [
        MAX_STAGE,
        MAX_MODULE_OPTIONS,
        getBotToken(resolved.botName),
        MaxValidationService,
        MaxAuthGuard
      ]
    }
  }

  static forRootAsync(options: MaxModuleAsyncOptions): DynamicModule {
    const botToken = getBotToken(options.botName)

    return {
      module: MaxCoreModule,
      global: options.global ?? true,
      imports: options.imports ?? [],
      providers: [
        ...this.createAsyncProviders(options),
        ...this.coreProviders(botToken),
        MaxValidationService,
        MaxAuthGuard
      ],
      exports: [MAX_STAGE, MAX_MODULE_OPTIONS, botToken, MaxValidationService, MaxAuthGuard]
    }
  }

  // Провайдеры, общие для forRoot/forRootAsync (бот, имя, stage).
  private static coreProviders(botToken: string): Provider[] {
    return [
      { provide: MAX_BOT_NAME, useValue: botToken },
      { provide: MAX_STAGE, useClass: Stage },
      {
        provide: botToken,
        useFactory: (options: MaxModuleOptions) => {
          const contextType = options.contextType ?? WizardContext
          const bot = new Bot<Context>(options.token, { contextType })
          bot.use(session())

          if (options.middlewares?.length) {
            bot.use(...options.middlewares)
          }

          bot.catch((error) => {
            // Отказ guard'а (CanActivate → false) бросает ForbiddenException;
            // пользователю уже ответил сам guard — шумить в лог не нужно.
            if (error instanceof ForbiddenException) {
              return
            }

            Logger.error(`${formatError(error)}`, 'MaxBot')
          })

          return bot
        },
        inject: [MAX_MODULE_OPTIONS]
      }
    ]
  }

  private static createAsyncProviders(options: MaxModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: MAX_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? []
        }
      ]
    }

    const inject = (options.useExisting || options.useClass) as Type<MaxOptionsFactory>
    const providers: Provider[] = [
      {
        provide: MAX_MODULE_OPTIONS,
        useFactory: (factory: MaxOptionsFactory) => factory.createMaxOptions(),
        inject: [inject]
      }
    ]
    if (options.useClass) {
      providers.push({ provide: options.useClass, useClass: options.useClass })
    }
    return providers
  }

  // ── Жизненный цикл polling'а ──────────────────────────────────────────────

  onApplicationBootstrap(): void {
    if (this.options.enable) {
      this.bot = this.moduleRef.get<Bot<Context>>(this.botName, { strict: false })
      this.initialize()
    }
  }

  private initialize(attempt = 0): void {
    if (this.isStopping || !this.bot) {
      return
    }

    this.logger.log('MAX bot initializing ...')

    this.bot.start().catch((error) => {
      if (this.isStopping) {
        return
      }

      this.bot?.stop()
      this.logger.error(`MAX bot polling crashed ${formatError(error)}`)

      const delay = Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS)
      this.logger.warn(`MAX bot restarting in ${delay / 1000}s (attempt ${attempt + 1})`)

      setTimeout(() => this.initialize(attempt + 1), delay)
    })
  }

  onApplicationShutdown(): void {
    if (this.options.enable) {
      this.isStopping = true
      this.bot?.stop()
      this.logger.log('MAX bot polling stopped')
    }
  }
}
