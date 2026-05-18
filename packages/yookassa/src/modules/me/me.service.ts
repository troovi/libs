import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type { GetMeRequest, GetMeResponse } from '../../api'

@Injectable()
export class MeService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Информация о настройках магазина или шлюза.
   *
   * С помощью этого запроса вы можете получить информацию о магазине или шлюзе.
   * Для Сплитования платежей передайте параметр on_behalf_of с идентификатором магазина продавца.
   * Для выплат используйте данные для аутентификации шлюза.
   */
  public async get(params: GetMeRequest = {}): Promise<GetMeResponse> {
    return this.http.get('/me', params)
  }
}
