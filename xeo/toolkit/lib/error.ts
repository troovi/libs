/**
 * Ошибка доменного слоя: `code` — для программ, `message` — для людей. Бросается одинаково на сервере и
 * при повторе на реплике. Приложение сужает коды наследником:
 * `class AppDomainError extends DomainError<AppCode> {}`.
 * Рантайм сам бросает два кода: `notFound` (операции нет в реестре) и `replayMismatch` (повтор
 * разошёлся с лентой).
 */
export class DomainError<Code extends string = string> extends Error {
  constructor(
    readonly code: Code,
    message: string
  ) {
    super(message)
    this.name = 'DomainError'
  }
}
