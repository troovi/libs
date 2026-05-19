# max-nestjs

NestJS-библиотека для валидации `initData` из мини-приложений MAX. Пакет предоставляет DI-модуль, guard для проверки подписи `WebAppData` и decorator для доступа к текущему пользователю в контроллерах.

Типы MAX Mini App берутся из `max-bridge`, поэтому не нужно дублировать модели `user`, `chat` и `initData`.

## Установка

```sh
npm i max-nestjs
```

Пакет рассчитан на NestJS 10 или 11.

## Подключение

Подключите `MaxModule` в корневом модуле приложения:

```ts
import { Module } from '@nestjs/common'
import { MaxModule } from 'max-nestjs'

@Module({
  imports: [
    MaxModule.forRoot({
      botToken: process.env.MAX_BOT_TOKEN!
    })
  ]
})
export class AppModule {}
```

Параметры модуля:

- `botToken` - токен бота MAX для валидации подписи.
- `headerName` - имя заголовка с raw init data. По умолчанию `x-max-init-data`.
- `maxAgeSeconds` - максимальный возраст `auth_date` в секундах. По умолчанию `3600`.

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
- проверяет срок жизни `auth_date`
- записывает данные в `request.maxInitData` и `request.maxUser`
