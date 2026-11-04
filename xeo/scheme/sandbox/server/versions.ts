import { Type } from '@nestjs/common'
import { CurrentModule } from '../versions/v-current/server/current.module'

export interface ServerVersion {
  /** Ключ версии — префикс маршрутов и папка `versions/<key>`. */
  key: string
  module: Type<unknown>
}

/** Реестр серверных модулей версий; клиентские — `app/versions.ts`. */
export const versions: ServerVersion[] = [{ key: 'v-current', module: CurrentModule }]
