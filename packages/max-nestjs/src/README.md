# max-bot-nestjs

NestJS-интеграция для [`@maxhub/max-bot-api`](https://www.npmjs.com/package/@maxhub/max-bot-api) — SDK ботов мессенджера [MAX](https://max.ru). Декларативные обработчики через декораторы (`@Update`, `@Command`, `@On`, `@Action`, `@Hears`), сцены и пошаговые wizard-диалоги, сессии и guard для авторизации mini-app.

## Референс

API намеренно повторяет [`nestjs-telegraf`](https://github.com/bukhalo/nestjs-telegraf), а слой сцен/wizard/session портирован из [`telegraf`](https://github.com/telegraf/telegraf) (`scenes/base.ts`, `scenes/context.ts`, `scenes/wizard/*`, `session`). Если вы работали с Telegraf в NestJS — здесь почти всё на своих местах:

| nestjs-telegraf / telegraf | max-bot-nestjs |
| -------------------------- | -------------- |
| `TelegrafModule`           | `MaxCoreModule` |
| `@Update()`                | `@Update()` |
| `@Ctx()` / `@Next()`       | `@Ctx()` / `@Next()` |
| `@Command` / `@On` / `@Hears` / `@Action` | то же |
| `Scenes.BaseScene` / `WizardScene` | `@Scene` / `@Wizard` + `@SceneEnter` / `@WizardStep` |
| `session()`                | `session()` |
| `ctx.scene` / `ctx.wizard` | `ctx.scene` / `ctx.wizard` |

Главное отличие: у `@maxhub/max-bot-api` `Composer` не имеет `lazy/optional/unwrap`, поэтому диспетчеризация сцен реализована вручную (`Stage` разбит на фазы `attach` → `@Update`-команды → `execute`), что позволяет командам прерывать активную сцену.

## Установка

```bash
npm install @maxhub/max-bot-api
```

Пиры: `@nestjs/common`, `@nestjs/core`, `reflect-metadata` (как в любом NestJS-проекте).

## Быстрый старт

### 1. Подключите модуль

```ts
import { Module } from '@nestjs/common'
import { MaxCoreModule } from 'max-bot-nestjs'
import { EchoUpdate } from './echo.update'

@Module({
  imports: [
    MaxCoreModule.forRoot({
      token: process.env.BOT_TOKEN!,
      launch: true // запускать polling (false для dev/тестов)
    })
  ],
  providers: [EchoUpdate]
})
export class BotModule {}
```

Асинхронная конфигурация — через `forRootAsync` (`useFactory` / `useClass` / `useExisting`):

```ts
MaxCoreModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    token: config.get('BOT_TOKEN'),
    launch: true
  }),
  inject: [ConfigService]
})
```

### 2. Опишите обработчики

```ts
import { Injectable } from '@nestjs/common'
import { Update, Command, On, Ctx, Message } from 'max-bot-nestjs'
import type { Context } from '@maxhub/max-bot-api'

@Injectable()
@Update()
export class EchoUpdate {
  @Command('start')
  start() {
    // строка, возвращённая из обработчика, автоматически отправляется ctx.reply
    return 'Привет! Я эхо-бот.'
  }

  @On('message_created')
  async echo(@Ctx() ctx: Context) {
    await ctx.reply(ctx.message?.body?.text ?? '...')
  }
}
```

Классы-обработчики — это обычные NestJS-провайдеры: в них работает DI, `@UseGuards`, lifecycle-хуки (`OnModuleInit`) и т.д. Они сканируются автоматически — отдельной регистрации на боте не нужно.

## Декораторы

### Классы

| Декоратор | Назначение |
| --------- | ---------- |
| `@Update()` | Класс-обработчик апдейтов (аналог `@Controller`). |
| `@MaxComposer()` | Отдельный composer; регистрируется в `Stage` до сцен. |
| `@Scene(id, options?)` | Базовая сцена. |
| `@Wizard(id, options?)` | Wizard-сцена (пошаговый диалог). |

### Методы-слушатели

| Декоратор | Эквивалент на боте |
| --------- | ------------------ |
| `@Use()` | `bot.use(...)` |
| `@On(updateType)` | `bot.on(...)` |
| `@Command(name)` | `bot.command(...)` |
| `@Hears(trigger)` | `bot.hears(...)` |
| `@Action(trigger)` | `bot.action(...)` |
| `@SceneEnter()` | обработчик входа в сцену |
| `@SceneLeave()` | обработчик выхода из сцены |
| `@WizardStep(n)` | шаг wizard-сцены (нумерация с 0) |

### Параметры

| Декоратор | Значение |
| --------- | -------- |
| `@Ctx()` | контекст апдейта |
| `@Next()` | переход к следующему middleware |
| `@Sender()` | отправитель |
| `@Message()` | сообщение |
| `@Payload()` | payload callback-кнопки |

### Инъекция бота

```ts
import { InjectBot } from 'max-bot-nestjs'
import { Bot, Context } from '@maxhub/max-bot-api'

@Injectable()
export class NotifyService {
  constructor(@InjectBot() private readonly bot: Bot<Context>) {}
}
```

## Сцены

Сцена — изолированный набор обработчиков. Войти в неё можно из любого места через `ctx.scene.enter(id)`, выйти — `ctx.scene.leave()`. Состояние сцены живёт в `ctx.session` (см. ниже).

```ts
@Injectable()
@Scene('greeter')
export class GreeterScene {
  @SceneEnter()
  onEnter() {
    return 'Как вас зовут?'
  }

  @On('message_created')
  async onName(@Ctx() ctx: Context) {
    await ctx.reply(`Приятно познакомиться, ${ctx.message?.body?.text}!`)
    await ctx.scene.leave()
  }
}
```

`@Scene`/`@Wizard` принимают `SceneOptions`: `ttl` (время жизни сцены в секундах), `handlers`, `enterHandlers`, `leaveHandlers`.

## Wizard-сцены

Wizard — линейная последовательность шагов. Курсор хранится в `ctx.wizard`; переход — `ctx.wizard.next()` / `.back()` / `.selectStep(n)`. Начальное состояние передаётся вторым аргументом в `ctx.scene.enter(id, state)` и доступно как `ctx.scene.state`.

```ts
@Injectable()
@Wizard('signup')
export class SignupWizard {
  @WizardStep(0)
  async askName(@Ctx() ctx: Context) {
    ctx.wizard.next()
    await ctx.reply('Введите имя:')
  }

  @WizardStep(1)
  async askEmail(@Ctx() ctx: Context) {
    ;(ctx.scene.state as { name?: string }).name = ctx.message?.body?.text
    ctx.wizard.next()
    await ctx.reply('Введите почту:')
  }

  @WizardStep(2)
  async done(@Ctx() ctx: Context) {
    await ctx.reply('Регистрация завершена!')
    await ctx.scene.leave()
  }
}
```

> **Порядок диспетчеризации.** Команды (`@Update` + `@Command`) регистрируются *до* сцен, поэтому `/start` или `/help` прервут активный wizard. Внутри обработчика команды обычно стоит вызвать `ctx.scene.leave()`.

## Сессии

`session()` middleware подключается автоматически и кладёт `ctx.session`. По умолчанию ключ сессии — id пользователя MAX (`getDefaultSessionKey`), хранилище — in-memory `MemorySessionStore`.

Для своего хранилища (Redis, Mongo, …) реализуйте `SessionStore<T>` и передайте собственный `session()` в `middlewares`:

```ts
import { session, SessionStore } from 'max-bot-nestjs'

class MongoSessionStore<T> implements SessionStore<T> {
  async get(key: string) { /* ... */ }
  async set(key: string, value: T) { /* ... */ }
  async delete(key: string) { /* ... */ }
}

MaxCoreModule.forRoot({
  token,
  launch: true,
  middlewares: [session({ store: new MongoSessionStore() })]
})
```

## Авторизация mini-app

`MaxAuthGuard` валидирует подпись init data, приходящей из MAX mini-app по HTTP-заголовку (по умолчанию `x-max-init-data`, настраивается через `headerName`). При успехе кладёт распарсенные данные в `request.maxInitData`. Достать пользователя в HTTP-контроллере — декоратором `@MaxUser()`:

```ts
import { UseGuards } from '@nestjs/common'
import { MaxAuthGuard, MaxUser, MaxUserData } from 'max-bot-nestjs'

@UseGuards(MaxAuthGuard)
@Get('profile')
profile(@MaxUser() user: MaxUserData) {
  return user
}
```

Подпись проверяется по схеме MAX: `HMAC-SHA256(token, key='WebAppData')` → `HMAC-SHA256(dataCheckString)`, сравнение в постоянном времени.

## Опции модуля

| Опция | Тип | По умолчанию | Описание |
| ----- | --- | ------------ | -------- |
| `token` | `string` | — | Токен бота (обязателен). |
| `botName` | `string` | `DEFAULT_MAX_BOT` | Имя для мульти-бот сценариев / `@InjectBot(name)`. |
| `contextType` | класс | `WizardContext` | Кастомный класс контекста. |
| `include` | `Function[]` | все модули | Ограничить сканирование указанными модулями. |
| `middlewares` | `Middleware[]` | — | Middleware, применяемые сразу после `session`. |
| `launch` | `boolean` | `false` | Запускать ли polling. |
| `headerName` | `string` | `x-max-init-data` | Заголовок с raw init data для `MaxAuthGuard`. |

## Жизненный цикл

`MaxCoreModule` сам запускает polling на `onApplicationBootstrap` (если `launch: true`) и останавливает на `onApplicationShutdown`. При падении polling'а — автоматический рестарт с экспоненциальной задержкой (5с → 60с). Чтобы хуки shutdown работали, включите их в приложении: `app.enableShutdownHooks()`.

## Лицензия

MIT
