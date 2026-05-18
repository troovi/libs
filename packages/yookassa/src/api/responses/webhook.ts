import { NotificationEventEnum } from '../enums'

/**
 * Объект Webhook
 *
 * Объект Webhook содержит информацию о подписке на одно событие.
 *
 * Объект может содержать параметры и значения, не описанные в этом Справочнике API. Их следует игнорировать.
 *
 * Данные о webhook.
 */
export interface Webhook {
  /**
   * Идентификатор webhook.
   */
  id: string
  /**
   * Событие, о котором уведомляет ЮKassa.
   */
  event: NotificationEventEnum
  /**
   * URL, на который ЮKassa отправляет уведомления.
   */
  url: string
}

/* Operation responses */
/**
 * Создание webhook
 *
 * В ответ на запрос придет созданный объект webhook.
 */
export type CreateWebhookResponse = Webhook

/**
 * Список созданных webhook
 *
 * В ответ на запрос придет актуальный список объектов webhook.
 */
export interface GetWebhookListResponse {
  type: 'list'
  items: Webhook[]
}
