import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type { CreateWebhookRequest, CreateWebhookResponse, GetWebhookListResponse } from '../../api'

@Injectable()
export class WebhookService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание webhook.
   *
   * Запрос позволяет подписаться на уведомления о событиях.
   * C помощью webhook можно подписаться только на события платежей и возвратов.
   * Для каждого OAuth-токена нужно создавать свой набор webhook.
   */
  public async create(data: CreateWebhookRequest): Promise<CreateWebhookResponse> {
    return this.http.post('/webhooks', data)
  }

  /**
   * Список созданных webhook.
   *
   * Запрос позволяет узнать, какие webhook есть для переданного OAuth-токена.
   */
  public async getAll(): Promise<GetWebhookListResponse> {
    return this.http.get('/webhooks')
  }

  /**
   * Удаление webhook.
   *
   * Запрос позволяет отписаться от уведомлений о событии для переданного OAuth-токена.
   * Чтобы удалить webhook, вам нужно передать в запросе его идентификатор.
   */
  public async delete(id: string): Promise<void> {
    return this.http.delete(`/webhooks/${id}`)
  }
}
