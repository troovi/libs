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
}

export type MaxResolvedModuleOptions = {
  botToken: string
  headerName: string
}

export type MaxModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<MaxModuleOptions>, 'useFactory' | 'inject'>
