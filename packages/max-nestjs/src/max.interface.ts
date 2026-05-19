import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export type MaxModuleOptions = {
  /**
   * Токен бота MAX, используемый для проверки подписи init data.
   */
  botToken: string

  /**
   * Имя HTTP-заголовка, из которого guard читает raw init data.
   * По умолчанию: `x-max-init-data`.
   */
  headerName?: string

  /**
   * Максимальный возраст init data в секундах.
   * По умолчанию: 3600.
   */
  maxAgeSeconds?: number
}

export type MaxResolvedModuleOptions = {
  botToken: string
  headerName: string
  maxAgeSeconds: number
}

export type MaxModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<MaxModuleOptions>, 'useFactory' | 'inject'>
