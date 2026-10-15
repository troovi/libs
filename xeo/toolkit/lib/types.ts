/**
 * Типы для приложения, внутри toolkit не используются: HTTP-маршруты контроллеров и оболочка сервера
 * как тип поля класса.
 */
import type { DomainEvent, DomainRoutes, DomainsMap } from './shell/helpers'
import type { createServerShell } from './shell/server'

/** Маршруты HTTP: ответ сервера — событие журнала с результатом метода. */
export type DomainApiRoutes<T extends DomainsMap> = {
  [D in keyof T]: {
    [M in keyof DomainRoutes<T>[D]]: {
      params: DomainRoutes<T>[D][M]['params']
      answer: DomainEvent<DomainRoutes<T>[D][M]['answer']>
    }
  }
}

/** Оболочка, собранная `createServerShell`, — тип для поля класса (например, сервиса NestJS). */
export type ServerShell<
  T extends DomainsMap,
  C extends ConstructorParameters<T[keyof T]>[0],
  Identity,
  Actor
> = ReturnType<typeof createServerShell<T, C, Identity, Actor>>
