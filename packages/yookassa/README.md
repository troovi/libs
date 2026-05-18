# @companix/yookassa

NestJS-библиотека для работы с API YooKassa. Пакет предоставляет типизированные DTO для запросов и ответов, HTTP-клиент с Basic Auth и набор сервисов для платежей, возвратов, чеков, выплат, сделок, webhook и других разделов API.

## Установка

```sh
npm i @companix/yookassa
```

Пакет рассчитан на NestJS 10 или 11.

## Подключение

Подключите `YookassaModule` в корневом модуле приложения:

```ts
import { Module } from '@nestjs/common'
import { YookassaModule } from '@companix/yookassa'

@Module({
  imports: [
    YookassaModule.forRoot({
      shopId: process.env.YOOKASSA_SHOP_ID!,
      apiKey: process.env.YOOKASSA_API_KEY!
    })
  ]
})
export class AppModule {}
```

Для конфигурации через `ConfigService` используйте `forRootAsync`:

```ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { YookassaModule } from '@companix/yookassa'

@Module({
  imports: [
    ConfigModule.forRoot(),
    YookassaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        shopId: config.getOrThrow('YOOKASSA_SHOP_ID'),
        apiKey: config.getOrThrow('YOOKASSA_API_KEY'),
        proxyUrl: config.get('YOOKASSA_PROXY_URL')
      }),
      inject: [ConfigService]
    })
  ]
})
export class AppModule {}
```

Параметры модуля:

- `shopId` - идентификатор магазина YooKassa.
- `apiKey` - секретный ключ API.
- `proxyUrl` - опциональный HTTP/HTTPS-прокси, например `http://127.0.0.1:8080`.

## Использование

`YookassaModule` является глобальным модулем, поэтому после подключения можно внедрять `YookassaService` в любые провайдеры.

```ts
import { Injectable } from '@nestjs/common'
import { CurrencyEnum, YookassaService } from '@companix/yookassa'

@Injectable()
export class OrdersService {
  public constructor(private readonly yookassa: YookassaService) {}

  public async createPayment(orderId: string) {
    const payment = await this.yookassa.payments.create({
      amount: {
        value: '1000.00',
        currency: CurrencyEnum.RUB
      },
      capture: true,
      description: `Оплата заказа ${orderId}`,
      confirmation: {
        type: 'redirect',
        return_url: `https://example.com/orders/${orderId}/payment`
      },
      metadata: {
        orderId
      }
    })

    return payment.confirmation
  }
}
```

Можно внедрять и отдельные сервисы, если нужен только один раздел API:

```ts
import { Injectable } from '@nestjs/common'
import { PaymentService } from '@companix/yookassa'

@Injectable()
export class PaymentsService {
  public constructor(private readonly payments: PaymentService) {}

  public getPayment(id: string) {
    return this.payments.getById(id)
  }
}
```

## Webhook

Для защиты endpoint от запросов не из YooKassa используйте декоратор `@YookassaWebhook()`. Он подключает guard, который проверяет IP отправителя по whitelist YooKassa. Если приложение работает за reverse proxy, убедитесь, что корректно пробрасывается `x-forwarded-for`.

```ts
import { Body, Controller, Post } from '@nestjs/common'
import { WebhookNotification, YookassaWebhook } from '@companix/yookassa'

@Controller('webhooks')
export class WebhooksController {
  @Post('yookassa')
  @YookassaWebhook()
  public async handleYookassaWebhook(@Body() payload: WebhookNotification) {
    if (payload.event === 'payment.succeeded') {
      const payment = payload.object

      // Обновите заказ по payment.metadata или payment.id.
    }
  }
}
```

Создать webhook в YooKassa можно через сервис:

```ts
await yookassa.webhooks.create({
  event: 'payment.succeeded',
  url: 'https://example.com/webhooks/yookassa'
})
```

## Доступные сервисы

`YookassaService` объединяет сервисы по разделам API:

- `payments` - `create`, `getAll`, `getById`, `capture`, `cancel`.
- `refunds` - `create`, `getAll`, `getById`.
- `invoices` - `create`, `getById`.
- `paymentMethods` - `create`, `getById`.
- `receipts` - `create`, `getAll`, `getById`.
- `payouts` - `create`, `getAll`, `search`, `getById`.
- `sbpBanks` - `getAll`.
- `personalData` - `create`, `getById`.
- `deals` - `create`, `getAll`, `getById`.
- `webhooks` - `create`, `getAll`, `delete`.
- `me` - `get`.

## Типы и enum

Пакет экспортирует типы запросов, ответов, webhook-уведомлений, общие интерфейсы и enum:

```ts
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetPaymentResponse,
  WebhookNotification
} from '@companix/yookassa'
import { CurrencyEnum } from '@companix/yookassa'
```

## Ошибки

Ошибки API и сетевые ошибки приводятся к `YookassaError`.

```ts
try {
  await yookassa.payments.getById('payment-id')
} catch (error) {
  if (error instanceof YookassaError) {
    console.error(error.message)
  }
}
```

## Сборка

```sh
npm run build -w @companix/yookassa
```
