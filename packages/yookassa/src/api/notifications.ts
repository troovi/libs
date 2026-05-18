import { NotificationEventEnum, NotificationTypeEnum } from './enums'
import { Payment } from './responses'

/**
 * Базовый интерфейс уведомления вебхука Юкассы.
 */
export interface BaseWebhookNotification<E extends NotificationEventEnum, T> {
  /**
   * Тип уведомления.
   */
  type: NotificationTypeEnum

  /**
   * Тип события.
   */
  event: E

  /**
   * Объект события (платеж, возврат и т.д.).
   */
  object: T
}

// prettier-ignore
export interface PaymentWebHook extends BaseWebhookNotification<NotificationEventEnum.PAYMENT_WAITING_FOR_CAPTURE | NotificationEventEnum.PAYMENT_SUCCEEDED | NotificationEventEnum.PAYMENT_CANCELED | NotificationEventEnum.REFUND_SUCCEEDED, Payment> {}

export type WebhookNotification = PaymentWebHook
