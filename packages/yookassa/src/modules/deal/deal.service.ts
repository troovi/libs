import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type {
  CreateDealRequest,
  CreateDealResponse,
  GetDealResponse,
  GetDealsListRequest,
  GetDealsListResponse
} from '../../api'

@Injectable()
export class DealService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание сделки.
   *
   * Запрос позволяет создать сделку, в рамках которой необходимо принять оплату от покупателя и перечислить ее продавцу.
   */
  public async create(data: CreateDealRequest): Promise<CreateDealResponse> {
    return this.http.post('/deals', data)
  }

  /**
   * Список сделок.
   *
   * Запрос позволяет получить список сделок, отфильтрованный по заданным критериям.
   * Подробнее о работе со списками.
   */
  public async getAll(params: GetDealsListRequest = {}): Promise<GetDealsListResponse> {
    return this.http.get('/deals', params)
  }

  /**
   * Информация о сделке.
   *
   * Запрос позволяет получить информацию о текущем состоянии сделки по ее уникальному идентификатору.
   */
  public async getById(id: string): Promise<GetDealResponse> {
    return this.http.get(`/deals/${id}`)
  }
}
