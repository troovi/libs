import { Injectable } from '@nestjs/common'

import { YookassaHttpClient } from '../../http/yookassa.http-client'
import type {
  CreatePersonalDataRequest,
  CreatePersonalDataResponse,
  GetPersonalDataResponse
} from '../../api'

@Injectable()
export class PersonalDataService {
  public constructor(private readonly http: YookassaHttpClient) {}

  /**
   * Создание персональных данных.
   *
   * Используйте этот запрос, чтобы создать в ЮKassa объект персональных данных.
   * В запросе необходимо указать тип данных и передать информацию о пользователе:
   * фамилию, имя, отчество и другие данные в зависимости от выбранного типа.
   */
  public async create(data: CreatePersonalDataRequest): Promise<CreatePersonalDataResponse> {
    return this.http.post('/personal_data', data)
  }

  /**
   * Информация о персональных данных.
   *
   * С помощью этого запроса вы можете получить информацию о текущем статусе объекта персональных данных
   * по его уникальному идентификатору.
   */
  public async getById(id: string): Promise<GetPersonalDataResponse> {
    return this.http.get(`/personal_data/${id}`)
  }
}
