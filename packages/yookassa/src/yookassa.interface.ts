import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'

export const YookassaOptionsSymbol = Symbol('YookassaOptionsSymbol')

/**
 * Настройки модуля YooKassa.
 */
export type YookassaModuleOptions = {
  /**
   * Идентификатор магазина YooKassa.
   */
  shopId: string

  /**
   * Секретный ключ API.
   */
  apiKey: string

  /**
   * Прокси-URL для отправки запросов к API YooKassa.
   * Используется в случаях, когда требуется направлять HTTP/HTTPS-запросы через прокси-сервер.
   * Например: http://127.0.0.1:8080
   */
  proxyUrl?: string
}

/**
 * Асинхронная конфигурация модуля.
 */
export type YookassaModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<YookassaModuleOptions>, 'useFactory' | 'inject'>

/**
 * Тип для метаданных ЮКасса.
 *
 * Ограничения ЮКасса:
 * - Максимум 16 ключей
 * - Имя ключа не больше 32 символов
 * - Значение ключа не больше 512 символов
 * - Тип данных — строка в формате UTF-8
 */
export type YookassaMetadata<T extends Record<string, string> = Record<string, string>> = T
