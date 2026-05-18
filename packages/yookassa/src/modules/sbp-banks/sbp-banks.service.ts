import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type { GetSbpBanksListResponse } from '../../api'

@Injectable()
export class SbpBanksService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Список участников СБП.
   *
   * С помощью этого запроса вы можете получить актуальный список всех участников СБП.
   * Список нужно вывести получателю выплаты, идентификатор выбранного участника СБП
   * необходимо использовать в запросе на создание выплаты.
   */
  public async getAll(): Promise<GetSbpBanksListResponse> {
    return this.http.get('/sbp_banks')
  }
}
