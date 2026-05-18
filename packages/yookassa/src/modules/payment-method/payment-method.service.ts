import { Injectable } from '@nestjs/common'
import type {
  CreatePaymentMethodRequest,
  CreatePaymentMethodResponse,
  GetPaymentMethodResponse
} from '../../api'
import { YookassaHttpClient } from '../../http/yookassa.http-client'

@Injectable()
export class PaymentMethodService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание способа оплаты.
   *
   * Используйте этот запрос, чтобы создать в ЮKassa объект способа оплаты.
   * В запросе необходимо передать код способа оплаты, который вы хотите сохранить,
   * и при необходимости дополнительные параметры, связанные с той функциональностью, которую вы хотите использовать.
   */
  public async create(data: CreatePaymentMethodRequest): Promise<CreatePaymentMethodResponse> {
    return this.http.post('/payment_methods', data)
  }

  /**
   * Информация о способе оплаты.
   *
   * Используйте этот запрос, чтобы получить информацию о текущем состоянии способа оплаты по его уникальному идентификатору.
   */
  public async getById(id: string): Promise<GetPaymentMethodResponse> {
    return this.http.get(`/payment_methods/${id}`)
  }
}
