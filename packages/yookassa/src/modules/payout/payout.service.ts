import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type {
  CreatePayoutRequest,
  CreatePayoutResponse,
  GetPayoutResponse,
  GetPayoutsListRequest,
  GetPayoutsListResponse,
  GetPayoutsSearchRequest,
  GetPayoutsSearchResponse
} from '../../api'

@Injectable()
export class PayoutService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание выплаты.
   *
   * Используйте этот запрос, чтобы создать в ЮKassa объект выплаты.
   * В запросе необходимо передать сумму выплаты, данные о способе получения выплаты,
   * описание выплаты и при необходимости дополнительные параметры.
   */
  public async create(data: CreatePayoutRequest): Promise<CreatePayoutResponse> {
    return this.http.post('/payouts', data)
  }

  /**
   * Список выплат.
   *
   * Используйте этот запрос, чтобы получить список выплат.
   * Для выгрузки доступны выплаты, созданные за последние 3 года.
   * Список можно отфильтровать по различным критериям.
   */
  public async getAll(params: GetPayoutsListRequest = {}): Promise<GetPayoutsListResponse> {
    return this.http.get('/payouts', params)
  }

  /**
   * Поиск выплат.
   *
   * Используйте этот запрос для поиска выплат по заданным критериям.
   * Доступно только для выплат, созданных за последние 3 месяца.
   * Сейчас доступен поиск только по параметру metadata.
   */
  public async search(params: GetPayoutsSearchRequest = {}): Promise<GetPayoutsSearchResponse> {
    return this.http.get('/payouts/search', params)
  }

  /**
   * Информация о выплате.
   *
   * Используйте этот запрос, чтобы получить информацию о текущем состоянии выплаты по ее уникальному идентификатору.
   */
  public async getById(id: string): Promise<GetPayoutResponse> {
    return this.http.get(`/payouts/${id}`)
  }
}
