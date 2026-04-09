import { BaseCollectionDriver, CollectionScheme, DataSource, IType } from '@companix/xeo-scheme'
import { MutationEvent, MutationListener } from './types'

export class ReactionService<Scheme extends CollectionScheme> {
  private store: { [model: string]: Set<MutationListener> } = {}

  constructor(dataSource: DataSource<Scheme, BaseCollectionDriver<Scheme>>) {
    const identifierKeys: { [model: string]: IType } = {}

    for (const key in dataSource.scheme.collections) {
      const info = dataSource.scheme.collections[key]
      identifierKeys[info.name] = info.identifierKey

      this.store[info.name] = new Set()
    }

    dataSource.driver.subscribeOnMutation(({ type, data }) => {
      if (type === 'update') {
        this.notify({
          type: 'update',
          model: data.model,
          id: data.id,
          fields: data.patches.map((patch) => patch.address)
        })
      }

      if (type === 'create') {
        const idKey = identifierKeys[data.model]
        const id = (data.data as Record<string, IType>)[idKey]

        this.notify({ type: 'create', model: data.model, id })
      }

      if (type === 'remove') {
        this.notify({ type: 'remove', model: data.model, id: data.id })
      }
    })
  }

  subscribe(model: string, listener: MutationListener): () => void {
    this.store[model].add(listener)

    return () => {
      this.store[model].delete(listener)
    }
  }

  private notify(event: MutationEvent) {
    const listeners = this.store[event.model]

    if (listeners) {
      listeners.forEach((cb) => cb(event))
    }
  }
}
