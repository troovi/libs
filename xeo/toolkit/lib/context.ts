/**
 * Контекст вызова домена. Создаёт только сервер: актор, единый момент `at`, календарная дата `today` и
 * лента идентификаторов. Реплики повторяют событие с уже разрешённым контекстом, поэтому время, номера
 * и строковые id совпадают у всех.
 */
import { hash } from '@companix/utils-js'
import { DomainError } from './error'

/** Запись ленты: метка (для проверки ветвления при повторе) и выданный идентификатор. */
export type TapeEntry = [label: string, id: string | number]

/** Сериализуемый контекст — уходит в событие журнала. */
export interface ResolvedContext<Actor = unknown> {
  actor: Actor | null
  at: number
  today: string
  ids: TapeEntry[]
}

export interface IdTape<Source extends string = string> {
  /** Строковый id: на сервере `hash()`, при повторе — следующая запись ленты с той же меткой. */
  string(label: string): string
  /** Числовой номер из счётчика `source`; при повторе счётчик подтягивается до выданного значения. */
  number(source: Source): Promise<number>
}

export interface DomainContext<Actor = unknown, Source extends string = string> {
  /** `null` — система (посев, служебные вызовы сервера). */
  actor: Actor | null
  /** Единый момент вызова, мс. */
  at: number
  /** Дата `YYYY-MM-DD` момента `at` в часовом поясе приложения — вычисляет сервер. */
  today: string
  ids: IdTape<Source>
}

export interface CounterRecord<Source extends string = string> {
  source: Source
  /** Последний выданный номер. */
  seq: number
}

/** Коллекция счётчиков числовых идентификаторов с идентификатором `source` — подходит коллекция xeo. */
export interface CounterCollection<Source extends string = string> {
  exists(source: Source): boolean | Promise<boolean>
  create(record: CounterRecord<Source>): Promise<boolean>
  update(source: Source, mutate: (draft: CounterRecord<Source>) => void): Promise<boolean>
}

/** Ключи коллекций, подходящих как счётчик числовых идентификаторов `{ source, seq }`. */
export type CounterKey<C> = { [K in keyof C]: C[K] extends CounterCollection<any> ? K : never }[keyof C]

export interface ContextOrigin<Actor = unknown> {
  actor: Actor | null
  at: number
  today: string
}

const mismatch = (label: string) =>
  new DomainError('replayMismatch', `Replay diverged from the server: expected identifier "${label}"`)

class RecordingTape<Source extends string> implements IdTape<Source> {
  readonly entries: TapeEntry[] = []

  constructor(private counter: CounterCollection<Source>) {}

  string(label: string) {
    const id = hash()
    this.entries.push([label, id])
    return id
  }

  async number(source: Source) {
    let seq = 0

    if (!(await this.counter.exists(source))) {
      await this.counter.create({ source, seq: 0 })
    }

    await this.counter.update(source, (draft) => {
      draft.seq += 1
      seq = draft.seq
    })

    this.entries.push([source, seq])
    return seq
  }
}

class ReplayTape<Source extends string> implements IdTape<Source> {
  private cursor = 0

  constructor(
    private counter: CounterCollection<Source>,
    private entries: TapeEntry[]
  ) {}

  private next(label: string) {
    const entry = this.entries[this.cursor]

    if (!entry || entry[0] !== label) {
      throw mismatch(label)
    }

    this.cursor += 1
    return entry[1]
  }

  string(label: string) {
    return String(this.next(label))
  }

  async number(source: Source) {
    const seq = Number(this.next(source))

    if (!(await this.counter.exists(source))) {
      await this.counter.create({ source, seq })
    } else {
      await this.counter.update(source, (draft) => {
        if (draft.seq < seq) {
          draft.seq = seq
        }
      })
    }

    return seq
  }

  /** После повтора лента должна быть прочитана целиком — иначе ветвление разошлось. */
  finish() {
    if (this.cursor !== this.entries.length) {
      throw mismatch(this.entries[this.cursor][0])
    }
  }
}

export const Context = {
  /** Серверный контекст: пишет ленту; `resolve()` отдаёт сериализуемый снимок для события. */
  record<Actor, Source extends string>(
    counter: CounterCollection<Source>,
    origin: ContextOrigin<Actor>
  ) {
    const tape = new RecordingTape(counter)
    const ctx: DomainContext<Actor, Source> = {
      actor: origin.actor,
      at: origin.at,
      today: origin.today,
      ids: tape
    }

    return {
      ctx,
      resolve: (): ResolvedContext<Actor> => ({
        actor: ctx.actor,
        at: ctx.at,
        today: ctx.today,
        ids: [...tape.entries]
      })
    }
  },

  /** Контекст реплики: читает ленту; `finish()` проверяет, что лента прочитана целиком. */
  replay<Actor, Source extends string>(
    counter: CounterCollection<Source>,
    resolved: ResolvedContext<Actor>
  ) {
    const tape = new ReplayTape(counter, resolved.ids)
    const ctx: DomainContext<Actor, Source> = {
      actor: resolved.actor,
      at: resolved.at,
      today: resolved.today,
      ids: tape
    }

    return { ctx, finish: () => tape.finish() }
  }
}
