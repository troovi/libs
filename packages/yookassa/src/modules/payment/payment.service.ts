import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type {
  CancelPaymentResponse,
  CapturePaymentRequest,
  CapturePaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetPaymentResponse,
  GetPaymentsListRequest,
  GetPaymentsListResponse
} from '../../api'

@Injectable()
export class PaymentService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание платежа.
   *
   * Чтобы принять оплату, необходимо создать объект платежа — Payment.
   * Он содержит всю необходимую информацию для проведения оплаты (сумму, валюту и статус).
   * У платежа линейный жизненный цикл, он последовательно переходит из статуса в статус.
   */
  public async create(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    return this.http.post('/payments', data)
  }

  /**
   * Список платежей.
   *
   * Используйте этот запрос, чтобы получить список платежей.
   * Для выгрузки доступны платежи, созданные за последние 3 года.
   * Список можно отфильтровать по различным критериям.
   * Подробнее о работе со списками.
   */
  public async getAll(params: GetPaymentsListRequest = {}): Promise<GetPaymentsListResponse> {
    return this.http.get('/payments', params)
  }

  /**
   * Информация о платеже.
   *
   * Запрос позволяет получить информацию о текущем состоянии платежа по его уникальному идентификатору.
   */
  public async getById(id: string): Promise<GetPaymentResponse> {
    return this.http.get(`/payments/${id}`)
  }

  /**
   * Подтверждение платежа.
   *
   * Подтверждает вашу готовность принять платеж.
   * После подтверждения платеж перейдет в статус succeeded.
   * Это значит, что вы можете выдать товар или оказать услугу пользователю.
   * Подтвердить можно только платеж в статусе waiting_for_capture и только в течение определенного времени.
   */
  public async capture(id: string, data?: CapturePaymentRequest): Promise<CapturePaymentResponse> {
    return this.http.post(`/payments/${id}/capture`, data)
  }

  /**
   * Отмена платежа.
   *
   * Отменяет платеж, находящийся в статусе waiting_for_capture.
   * Отмена платежа значит, что вы не готовы выдать пользователю товар или оказать услугу.
   * Как только вы отменяете платеж, ЮKassa начинает возвращать деньги на счет плательщика.
   */
  public async cancel(id: string): Promise<CancelPaymentResponse> {
    return this.http.post(`/payments/${id}/cancel`)
  }
}
