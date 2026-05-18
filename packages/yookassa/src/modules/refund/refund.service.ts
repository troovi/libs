import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type {
  CreateRefundRequest,
  CreateRefundResponse,
  GetRefundResponse,
  GetRefundsListRequest,
  GetRefundsListResponse
} from '../../api'

@Injectable()
export class RefundService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание возврата.
   *
   * Создает возврат успешного платежа на указанную сумму.
   * Платеж можно вернуть только в течение трех лет с момента его создания.
   * Комиссия ЮKassa за проведение платежа не возвращается.
   */
  public async create(data: CreateRefundRequest): Promise<CreateRefundResponse> {
    return this.http.post('/refunds', data)
  }

  /**
   * Список возвратов.
   *
   * Используйте этот запрос, чтобы получить список возвратов.
   * Для выгрузки доступны возвраты, созданные за последние 3 года.
   * Список можно отфильтровать по различным критериям.
   * Подробнее о работе со списками.
   */
  public async getAll(params: GetRefundsListRequest = {}): Promise<GetRefundsListResponse> {
    return this.http.get('/refunds', params)
  }

  /**
   * Информация о возврате.
   *
   * Запрос позволяет получить информацию о текущем состоянии возврата по его уникальному идентификатору.
   */
  public async getById(id: string): Promise<GetRefundResponse> {
    return this.http.get(`/refunds/${id}`)
  }
}
