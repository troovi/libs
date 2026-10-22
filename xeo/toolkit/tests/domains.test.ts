import {
  Collections,
  DataScheme,
  DataSource,
  Identifier,
  Model,
  Prop,
  createBaseDriver,
  defineCollection
} from '@companix/xeo-scheme'
import {
  Context,
  DomainContext,
  DomainError,
  DomainEvent,
  DomainsTransport,
  EventSync,
  PartialWrite,
  applyPatch,
  createClientShell,
  createServerShell,
  initializeDomains,
  methodOf
} from '../lib'

type Source = 'notes'

@Model({ name: 'Counter' })
class CounterEntity {
  @Identifier({ type: 'string' })
  source: Source

  @Prop({ type: 'number' })
  seq: number
}

@Model({ name: 'Note' })
class NoteEntity {
  @Identifier({ type: 'number' })
  noteId: number

  @Prop({ type: 'string' })
  key: string

  @Prop({ type: 'string' })
  text: string

  @Prop({ type: 'number' })
  createdAt: number
}

const scheme = new DataScheme({
  counter: defineCollection(CounterEntity, 'source'),
  note: defineCollection(NoteEntity, 'noteId')
})

type Scheme = typeof scheme extends DataScheme<infer S> ? S : never

interface Actor {
  name: string
}

class NotesDomain {
  constructor(private collections: Collections<Scheme>) {}

  async add(params: { text: string }, ctx: DomainContext<Actor, Source>) {
    const noteId = await ctx.ids.number('notes')
    const key = ctx.ids.string('note')

    await this.collections.note.create({ noteId, key, text: params.text, createdAt: ctx.at })

    return { noteId, key }
  }

  async rename(params: { noteId: number; text: string }) {
    await this.find(params.noteId)
    await this.collections.note.update(params.noteId, (draft) => {
      draft.text = params.text
    })
  }

  async whoami(_params: {}, ctx: DomainContext<Actor, Source>) {
    return { actor: ctx.actor, today: ctx.today }
  }

  /** Пишет и падает — частичная запись (номер из счётчика записью не считается). */
  async addBroken(params: { text: string }, ctx: DomainContext<Actor, Source>) {
    await this.add(params, ctx)
    throw new Error('after write')
  }

  private async find(noteId: number) {
    const note = await this.collections.note.get(noteId)

    if (!note) {
      throw new DomainError('notFound', `note ${noteId}`)
    }

    return note
  }
}

const domains = { notes: NotesDomain }

const source = () => new DataSource(scheme, { createDriver: createBaseDriver })

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

describe('лента идентификаторов', () => {
  it('повтор выдаёт те же идентификаторы и подтягивает счётчик', async () => {
    const server = source()
    const client = source()
    const recording = Context.record(server.collections.counter, {
      actor: null,
      at: 1,
      today: '2026-01-01'
    })
    const a = recording.ctx.ids.string('a')
    const n1 = await recording.ctx.ids.number('notes')
    const n2 = await recording.ctx.ids.number('notes')
    const resolved = recording.resolve()

    expect(resolved.ids).toEqual([
      ['a', a],
      ['notes', 1],
      ['notes', 2]
    ])
    expect(server.collections.counter.get('notes')?.seq).toBe(2)

    const replay = Context.replay(client.collections.counter, resolved)
    expect(replay.ctx.ids.string('a')).toBe(a)
    expect(await replay.ctx.ids.number('notes')).toBe(n1)
    expect(await replay.ctx.ids.number('notes')).toBe(n2)
    replay.finish()
    expect(client.collections.counter.get('notes')?.seq).toBe(2)
  })

  it('расхождение метки или недочитанная лента — replayMismatch', () => {
    const client = source()
    const resolved = {
      actor: null,
      at: 1,
      today: '2026-01-01',
      ids: [
        ['a', 'x'],
        ['b', 'y']
      ] as [string, string][]
    }

    const first = Context.replay(client.collections.counter, resolved)
    expect(() => first.ctx.ids.string('b')).toThrow(expect.objectContaining({ code: 'replayMismatch' }))

    const second = Context.replay(client.collections.counter, resolved)
    second.ctx.ids.string('a')
    expect(() => second.finish()).toThrow(expect.objectContaining({ code: 'replayMismatch' }))
  })
})

describe('рантайм доменов', () => {
  it('событие сервера повторяется на реплике с теми же id и временем', async () => {
    const server = source()
    const client = source()
    const services = {
      server: initializeDomains(domains, server.collections),
      client: initializeDomains(domains, client.collections)
    }

    const recording = Context.record(server.collections.counter, {
      actor: null,
      at: 42,
      today: '2026-01-01'
    })
    const call = { domain: 'notes', method: 'add', params: { text: 'первая' } }
    const result = await methodOf(services.server, call)(call.params, recording.ctx)
    const event: DomainEvent = clone({
      epoch: 'e1',
      revision: 1,
      ...call,
      ctx: recording.resolve(),
      result
    })

    // повтор, как в реплике: контекст из события, лента прочитана целиком
    const replay = Context.replay(client.collections.counter, event.ctx)

    expect(await methodOf(services.client, event)(event.params, replay.ctx)).toEqual(result)
    replay.finish()
    expect(client.collections.note.getAll()).toEqual(server.collections.note.getAll())
    expect(client.collections.counter.getAll()).toEqual(server.collections.counter.getAll())
    expect(client.collections.note.get(1)?.createdAt).toBe(42)
  })

  it('вызывает только собственные методы домена', async () => {
    const services = initializeDomains(domains, source().collections)
    const ctx = Context.record(source().collections.counter, {
      actor: null,
      at: 0,
      today: '2026-01-01'
    }).ctx
    const call = (domain: string, method: string) => () =>
      methodOf(services, { domain, method, params: {} })({}, ctx)

    expect(call('notes', 'toString')).toThrow(expect.objectContaining({ code: 'notFound' }))
    expect(call('notes', 'constructor')).toThrow(expect.objectContaining({ code: 'notFound' }))
    expect(call('notes', 'missing')).toThrow(expect.objectContaining({ code: 'notFound' }))
    expect(call('missing', 'add')).toThrow(expect.objectContaining({ code: 'notFound' }))
    // домен ищется только среди собственных ключей реестра: `toString.call` не находится
    expect(call('toString', 'call')).toThrow(expect.objectContaining({ code: 'notFound' }))
    await expect(call('notes', 'rename')()).rejects.toBeInstanceOf(DomainError)
  })
})

/** Журнал на базовом драйвере: события копятся в `events`, транспорт вызывает его от имени «автора». */
const createJournal = (serialize?: <D extends object>(document: D) => D) => {
  const events: DomainEvent[] = []
  const partial: PartialWrite[] = []
  const serverSource = source()
  const server = createServerShell(domains, serverSource, {
    counterCollection: 'counter',
    resolveActor: (name: string): Actor => {
      if (name === 'чужой') {
        throw new DomainError('forbidden', 'нет доступа')
      }

      return { name }
    },
    today: () => '2026-01-01',
    broadcast: (event) => events.push(clone(event)),
    onPartialWrite: (info) => partial.push(info),
    serialize
  })
  const http: DomainsTransport = {
    request: async <T>({ url, body }: { url: string; body: unknown }) => {
      const [, domain, method] = url.split('/')
      return clone(await server.run({ domain, method, params: body } as never, 'автор')) as T
    }
  }

  return { server, serverSource, http, events, partial }
}

describe('createServerShell', () => {
  it('нумерует события, рассылает их и пишет актора в контекст', async () => {
    const { server, events } = createJournal()
    const first = await server.run({ domain: 'notes', method: 'add', params: { text: 'a' } }, 'автор')
    const second = await server.run({ domain: 'notes', method: 'whoami', params: {} }, null)

    expect([first.revision, second.revision, server.revision]).toEqual([1, 2, 2])
    expect(events.map((event) => event.revision)).toEqual([1, 2])
    expect(first.result.noteId).toBe(1)
    expect(first.ctx.actor).toEqual({ name: 'автор' })
    expect(second.result).toEqual({ actor: null, today: '2026-01-01' })
  })

  it('частичная запись — onPartialWrite; отказ до записи и чужой актор — без ревизии', async () => {
    const { server, partial, events } = createJournal()

    await expect(
      server.run({ domain: 'notes', method: 'addBroken', params: { text: 'x' } }, null)
    ).rejects.toThrow('after write')
    expect(partial).toEqual([
      expect.objectContaining({ mutations: 1, call: expect.objectContaining({ method: 'addBroken' }) })
    ])

    await expect(
      server.run({ domain: 'notes', method: 'rename', params: { noteId: 99, text: '' } }, null)
    ).rejects.toBeInstanceOf(DomainError)
    await expect(
      server.run({ domain: 'notes', method: 'whoami', params: {} }, 'чужой')
    ).rejects.toThrow('нет доступа')

    expect(partial).toHaveLength(1)
    expect(events).toHaveLength(0)
    expect(server.revision).toBe(0)
  })

  it('opts.at задаёт момент вызова: он уходит в контекст события и в today', async () => {
    const { server } = createJournal()
    const at = Date.UTC(2026, 0, 15, 9, 30)
    const event = await server.run({ domain: 'notes', method: 'add', params: { text: 'a' } }, null, {
      at
    })
    const note = server.snapshot().then((snapshot) => snapshot.entities.note[0])

    expect(event.ctx.at).toBe(at)
    expect((await note).createdAt).toBe(at)
  })

  it('снимок ждёт текущий вызов и проходит через serialize', async () => {
    const { server } = createJournal((document) => ({ ...document, serialized: true }))
    const running = server.run({ domain: 'notes', method: 'add', params: { text: 'a' } }, null)
    const snapshot = await server.snapshot()

    await running
    expect(snapshot.revision).toBe(1)
    expect(snapshot.entities.note).toEqual([expect.objectContaining({ text: 'a', serialized: true })])
    expect(snapshot.entities.counter).toEqual([{ source: 'notes', seq: 1, serialized: true }])
  })
})

describe('createClientShell', () => {
  it('загружает снимок, сходится с журналом; наблюдатель — по рассылке', async () => {
    const { server, serverSource, http, events } = createJournal()
    await server.run({ domain: 'notes', method: 'add', params: { text: 'до снимка' } }, null)

    const snapshot = clone(await server.snapshot())
    const client = source()
    const replica = createClientShell(domains, client, {
      counterCollection: 'counter',
      resync: jest.fn()
    })
    const api = replica.createApi(http)

    replica.load(snapshot)
    expect(client.collections.note.getAll()).toEqual(serverSource.collections.note.getAll())

    const note = await api.notes.add({ text: 'первая' })
    await api.notes.rename({ noteId: note.noteId, text: 'вторая' })

    expect(client.collections.note.getAll()).toEqual(serverSource.collections.note.getAll())
    expect(client.collections.counter.getAll()).toEqual(serverSource.collections.counter.getAll())
    expect(replica.sync.revision).toBe(3)

    // наблюдатель получает только рассылку, включая событие до снимка — оно отбрасывается
    const observer = source()
    const watcher = createClientShell(domains, observer, {
      counterCollection: 'counter',
      resync: jest.fn()
    })

    watcher.load(snapshot)
    events.forEach((event) => watcher.sync.push(event))
    await watcher.sync.whenApplied(server.revision)
    expect(observer.collections.note.getAll()).toEqual(serverSource.collections.note.getAll())
  })

  it('внешняя пересинхронизация останавливает очередь', async () => {
    const resync = jest.fn()
    const apply = jest.fn()
    const sync = new EventSync({ apply, resync })

    sync.start({ epoch: 'e1', revision: 0 })
    const waiting = sync.whenApplied(1)
    sync.resync('socket')

    await expect(waiting).rejects.toThrow('sync: socket')
    expect(resync).toHaveBeenCalledWith('socket')

    sync.push({
      epoch: 'e1',
      revision: 1,
      domain: 'notes',
      method: 'add',
      params: {},
      ctx: { actor: null, at: 0, today: '2026-01-01', ids: [] },
      result: null
    })
    expect(apply).not.toHaveBeenCalled()
  })

  it('счётчиком может быть только коллекция `{ source, seq }`', () => {
    expect(() =>
      createClientShell(domains, source(), {
        // @ts-expect-error — коллекция заметок не счётчик
        counterCollection: 'note',
        resync: jest.fn()
      })
    ).not.toThrow()
  })

  it('then и символы не становятся вызовами', async () => {
    const request = jest.fn()
    const replica = createClientShell(domains, source(), {
      counterCollection: 'counter',
      resync: jest.fn()
    })
    const api = replica.createApi({ request })

    await Promise.resolve(api.notes)
    expect((api.notes as Record<PropertyKey, unknown>)[Symbol.toStringTag]).toBeUndefined()
    expect(request).not.toHaveBeenCalled()
  })
})

describe('applyPatch', () => {
  it('правит embedded по полям, json — целиком', () => {
    const draft = {
      name: 'a',
      file: { stage: 'assigned', meta: { filename: 'x' } },
      contacts: { phone: '1', extra: '2' }
    }

    applyPatch(
      draft,
      { file: { stage: 'empty' } as never, contacts: { phone: '3' } as never, name: undefined },
      ['contacts']
    )
    expect(draft).toEqual({ name: 'a', file: { stage: 'empty' }, contacts: { phone: '3', extra: '2' } })
  })
})

describe('EventSync', () => {
  const event = (revision: number, epoch = 'e1'): DomainEvent => ({
    epoch,
    revision,
    domain: 'd',
    method: 'm',
    params: {},
    ctx: { actor: null, at: 0, today: '2026-01-01', ids: [] },
    result: null
  })

  it('применяет по порядку, глушит дубли и ждёт разрыв', async () => {
    const applied: number[] = []
    const resync = jest.fn()
    const sync = new EventSync({
      apply: async (e) => {
        applied.push(e.revision)
      },
      resync,
      gapTimeout: 50
    })

    sync.push(event(3))
    sync.push(event(2))
    sync.start({ epoch: 'e1', revision: 1 })
    sync.push(event(2))
    await sync.whenApplied(3)
    expect(applied).toEqual([2, 3])
    expect(resync).not.toHaveBeenCalled()

    sync.push(event(5))
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(resync).toHaveBeenCalledWith('gap')
  })

  it('смена эпохи и ошибка повтора ведут к пересинхронизации', async () => {
    const resync = jest.fn()
    const sync = new EventSync({
      apply: async () => {
        throw new Error('boom')
      },
      resync
    })

    sync.start({ epoch: 'e1', revision: 0 })
    const waiting = sync.whenApplied(1)
    sync.push(event(1))
    await expect(waiting).rejects.toThrow('boom')
    expect(resync).toHaveBeenCalledWith('apply')

    const other = new EventSync({ apply: async () => undefined, resync })
    other.start({ epoch: 'e1', revision: 0 })
    other.push(event(1, 'e2'))
    expect(resync).toHaveBeenLastCalledWith('epoch')
  })
})
