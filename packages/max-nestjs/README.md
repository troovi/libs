# max-nestjs

NestJS-библиотека для валидации `initData` из мини-приложений MAX. Пакет предоставляет DI-модуль, guard для проверки подписи `WebAppData` и decorator для доступа к текущему пользователю в контроллерах.

Типы MAX Mini App берутся из `max-bridge`, поэтому не нужно дублировать модели `user`, `chat` и `initData`.

## Установка

```sh
npm i max-nestjs
```

Пакет рассчитан на NestJS 10 или 11.

## Подключение

Подключите `MaxCoreModule` в корневом модуле приложения:

```ts
import { Module } from '@nestjs/common'
import { MaxCoreModule } from 'max-nestjs'

@Module({
  imports: [
    MaxCoreModule.forRoot({
      token: process.env.MAX_BOT_TOKEN!,
      enable: true,
      maxAgeSeconds: 86400
    })
  ]
})
export class AppModule {}
```

Параметры модуля:

- `token` - токен бота MAX: подпись `initData` и API бота.
- `enable` - запускать ли long polling бота (без него guard и `bot.api` работают).
- `headerName` - имя заголовка с raw init data. По умолчанию `x-max-init-data`.
- `maxAgeSeconds` - максимальный возраст `auth_date` в секундах. По умолчанию не проверяется: документация MAX срок
  не задаёт.

## Использование

Клиент должен отправлять `window.WebApp.initData` в HTTP-заголовке `x-max-init-data`:

```ts
await fetch('/api/max/profile', {
  headers: {
    'x-max-init-data': window.WebApp.initData
  }
})
```

В контроллере подключите `MaxAuthGuard` и получите пользователя через `@MaxUser()`:

```ts
import { Controller, Get, UseGuards } from '@nestjs/common'
import { MaxAuthGuard, MaxUser, type MaxUserData } from 'max-nestjs'

@Controller('max')
export class MaxController {
  @Get('profile')
  @UseGuards(MaxAuthGuard)
  public getProfile(@MaxUser() user: MaxUserData) {
    return {
      id: user.id,
      username: user.username
    }
  }
}
```

Можно получить и отдельное поле пользователя:

```ts
public getProfile(@MaxUser('id') userId: number) {
  return { userId }
}
```

## Что делает guard

`MaxAuthGuard`:

- читает raw init data из заголовка
- проверяет, что параметры не дублируются
- собирает `launch_params` по правилам MAX
- вычисляет HMAC-подпись по `WebAppData`
- сравнивает `hash`
- проверяет срок жизни `auth_date`, если задан `maxAgeSeconds`
- записывает данные в `request.maxInitData` и `request.maxUser`

## Бот: опрос с сохранённым маркером

С `enable: true` модуль запускает long polling бота. Без маркера MAX отдаёт только последнее обновление, поэтому
после перезапуска приложения всё, что пришло за простой, кроме одного, теряется. Хранилище маркера это чинит: опрос
начинается с сохранённого маркера, обновления пачки обрабатываются по очереди (порядок сообщений одного человека
сохраняется), маркер сохраняется после обработки пачки. Сбой посреди пачки повторит её после перезапуска — повтор
приложение отсекает само, например по `body.mid` сообщения.

```ts
import { Injectable, Module } from '@nestjs/common'
import { MaxCoreModule, type MaxMarkerStore } from 'max-nestjs'

@Injectable()
export class BotMarkerStorage implements MaxMarkerStore {
  async load() {
    return readMarker() // number | null
  }

  async save(marker: number) {
    await writeMarker(marker)
  }
}

@Module({
  imports: [MaxCoreModule.forRoot({ token, enable: true, markerStore: BotMarkerStorage })],
  providers: [BotMarkerStorage]
})
export class BotModule {}
```

`markerStore` — класс провайдера приложения: модуль берёт экземпляр из контейнера. Без него — `bot.start()`
библиотеки MAX с маркером в памяти.

## Обработка обновления вне опроса

`MaxUpdateHandler.handle(update)` прогоняет одно обновление через ту же цепочку, что опрос: контекст, сцены,
обработчики `@Update`; ошибка обработчика остаётся в логе. Так приложение подаёт обновления, полученные иначе: свой
webhook, проверку на стенде без MAX. Типы обновления — `MaxUpdate`, `MaxMessage`, `MaxAttachment`.
