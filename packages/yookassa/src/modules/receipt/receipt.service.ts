import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type {
  CreateReceiptRequest,
  CreateReceiptResponse,
  GetReceiptResponse,
  GetReceiptsListRequest,
  GetReceiptsListResponse
} from '../../api'

@Injectable()
export class ReceiptService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание чека.
   *
   * Используйте этот запрос при оплате с соблюдением требований 54-ФЗ, чтобы создать чек зачета предоплаты.
   * Если вы работаете по сценарию Сначала платеж, потом чек, в запросе также нужно передавать данные
   * для формирования чека прихода и чека возврата прихода.
   */
  public async create(data: CreateReceiptRequest): Promise<CreateReceiptResponse> {
    return this.http.post('/receipts', data)
  }

  /**
   * Список чеков.
   *
   * Запрос позволяет получить список чеков, отфильтрованный по заданным критериям.
   * Можно запросить чеки по конкретному платежу, чеки по конкретному возврату или все чеки магазина.
   * Подробнее о работе со списками.
   */
  public async getAll(params: GetReceiptsListRequest = {}): Promise<GetReceiptsListResponse> {
    return this.http.get('/receipts', params)
  }

  /**
   * Информация о чеке.
   *
   * Запрос позволяет получить информацию о текущем состоянии чека по его уникальному идентификатору.
   */
  public async getById(id: string): Promise<GetReceiptResponse> {
    return this.http.get(`/receipts/${id}`)
  }
}
