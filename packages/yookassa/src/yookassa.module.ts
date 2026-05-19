import { type DynamicModule, Global, Module } from '@nestjs/common'

import { YookassaService } from './yookassa.service'
import { YookassaHttpClient } from './http/yookassa.http-client'
import { type YookassaModuleOptions, YookassaOptionsSymbol } from './yookassa.interface'
import { PaymentService } from './modules/payment/payment.service'
import { RefundService } from './modules/refund/refund.service'
import { InvoiceService } from './modules/invoice/invoice.service'
import { PaymentMethodService } from './modules/payment-method/payment-method.service'
import { ReceiptService } from './modules/receipt/receipt.service'
import { PayoutService } from './modules/payout/payout.service'
import { SbpBanksService } from './modules/sbp-banks/sbp-banks.service'
import { PersonalDataService } from './modules/personal-data/personal-data.service'
import { DealService } from './modules/deal/deal.service'
import { WebhookService } from './modules/webhook/webhook.service'
import { MeService } from './modules/me/me.service'
import { WebhookBootstrapService } from './modules/webhook'

const YOOKASSA_FEATURE_SERVICES = [
  PaymentService,
  RefundService,
  InvoiceService,
  PaymentMethodService,
  ReceiptService,
  PayoutService,
  SbpBanksService,
  PersonalDataService,
  DealService,
  WebhookService,
  WebhookBootstrapService,
  MeService
]

@Global()
@Module({})
export class YookassaModule {
  /**
   * Метод для регистрации модуля с синхронными параметрами.
   * Этот метод используется для конфигурации модуля с заранее заданными параметрами.
   * @param {YookassaModuleOptions} options - Настройки для конфигурации YooKassa.
   * @returns {DynamicModule} Возвращает динамический модуль с необходимыми провайдерами и импортами.
   *
   * @example
   * ```ts
   * YookassaModule.forRoot({
   *   shopId: 'your_shop_id',
   *   apiKey: 'your_api_key',
   * });
   * ```
   */
  public static forRoot(options: YookassaModuleOptions): DynamicModule {
    return {
      module: YookassaModule,
      providers: [
        { provide: YookassaOptionsSymbol, useValue: options },
        {
          provide: YookassaHttpClient,
          useFactory: (cfg: YookassaModuleOptions) => new YookassaHttpClient(cfg),
          inject: [YookassaOptionsSymbol]
        },

        ...YOOKASSA_FEATURE_SERVICES,
        YookassaService
      ],
      exports: [YookassaService, YookassaHttpClient, ...YOOKASSA_FEATURE_SERVICES],
      global: true
    }
  }
}
