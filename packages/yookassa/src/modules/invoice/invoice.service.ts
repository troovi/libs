import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type { CreateInvoiceRequest, CreateInvoiceResponse, GetInvoiceResponse } from '../../api'

@Injectable()
export class InvoiceService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание счета.
   *
   * Используйте этот запрос, чтобы создать в ЮKassa объект счета.
   * В запросе необходимо передать данные о заказе, которые отобразятся на странице счета,
   * и данные для проведения платежа.
   */
  public async create(data: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
    return this.http.post('/invoices', data)
  }

  /**
   * Информация о счете.
   *
   * Используйте этот запрос, чтобы получить информацию о текущем состоянии счета по его уникальному идентификатору.
   */
  public async getById(id: string): Promise<GetInvoiceResponse> {
    return this.http.get(`/invoices/${id}`)
  }
}
