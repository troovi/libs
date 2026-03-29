import { isObjectLike } from '@companix/utils-js'
import {
  UpdatePatch,
  CollectionDriver,
  DataScheme,
  IType,
  CollectionScheme,
  CollectionInfo,
  CollectionDriverParams
} from '../core'
import { BaseTableDriver } from './table.driver'
import { __DEV__, ExtractType, KeyOfType, styles, xRay } from '../utils'

export class IndexedCollectionStore<T> {
  private name: string
  private store: { [id: IType]: T } = {}
  private data: T[] = []

  private identifierKey: KeyOfType<T, IType>

  constructor(info: CollectionInfo<T>) {
    this.name = info.name
    this.identifierKey = info.identifierKey
  }

  initialize(items: T[]) {
    items.forEach((item) => {
      this.create(item)
    })
  }

  get(id: IType) {
    return this.store[id] ?? null
  }

  getAll() {
    return this.data
  }

  create(data: T) {
    if (__DEV__) {
      xRay.print('COLLECTIONS:CREATE', styles.pink)({ name: this.name }, 'data:', data)
    }

    this.data.push(data)
    this.store[data[this.identifierKey] as IType] = data
  }

  remove(id: IType) {
    if (__DEV__) {
      xRay.print('COLLECTIONS:REMOVE', styles.pink)({ name: this.name, id })
    }

    const index = this.data.findIndex((item) => {
      return item[this.identifierKey] === id
    })

    if (index !== -1) {
      this.data.splice(index, 1)
      delete this.store[id]
    }
  }

  update(id: IType, patches: UpdatePatch[]) {
    const target = this.get(id)

    if (target) {
      for (const { address, ...action } of patches) {
        if (action.type === 'set') {
          this.apply(target, address, (source, key) => {
            source[key] = action.value as never
          })
        }

        if (action.type === 'push') {
          this.apply(target, address, (source, key) => {
            ;(source[key] as Array<unknown>).push(...action.items)
          })
        }

        if (action.type === 'pull') {
          this.apply(target, address, (source, key) => {
            const items = source[key] as Array<unknown>

            action.items.forEach((item) => {
              const index = items.findIndex((i) => i === item)

              if (index !== -1) {
                items.splice(index, 1)
              }
            })
          })
        }
      }
    }

    if (__DEV__) {
      xRay.print('COLLECTIONS:UPDATE', styles.pink)({ id }, 'patches:', patches, 'result:', target)
    }
  }

  exists(id: IType) {
    return this.store[id] !== undefined
  }

  existsBy(filter: object = {}) {
    for (const item of this.data) {
      if (this.matchesFilter(item, filter)) {
        return true
      }
    }

    return false
  }

  findOneBy(filter: object = {}) {
    for (const item of this.data) {
      if (this.matchesFilter(item, filter)) {
        return item
      }
    }

    return null
  }

  findBy(filter: object = {}) {
    return this.data.filter((item) => {
      return this.matchesFilter(item, filter)
    })
  }

  count() {
    return this.data.length
  }

  /** Сопоставляет item с вложенным объектом фильтра (все листовые значения — через ===). */
  private matchesFilter(item: unknown, filter: unknown): boolean {
    if (filter === null || typeof filter !== 'object') {
      return item === filter
    }

    if (Array.isArray(filter)) {
      if (!Array.isArray(item) || item.length !== filter.length) {
        return false
      }

      return filter.every((entry, index) => this.matchesFilter(item[index], entry))
    }

    if (!isObjectLike(item)) {
      return false
    }

    for (const key of Object.keys(filter as object)) {
      if (!this.matchesFilter(item[key as keyof object], filter[key as keyof object])) {
        return false
      }
    }

    return true
  }

  private apply(target: object, address: string, change: (source: object, key: keyof object) => void) {
    const path = address.split('.')

    let current = target

    const getException = (segment: string, content: string) => {
      return `[internal]: segment "${segment}" in address "${address}", does not belongs to "${content}"`
    }

    path.forEach((segment, i) => {
      if (path.length - 1 === i) {
        if (isObjectLike(current) && segment in current) {
          change(current, segment as keyof object)
        } else {
          throw new Error(getException(segment, JSON.stringify(current)))
        }
      } else {
        if (isObjectLike(current) && segment in current) {
          current = current[segment as keyof object]
        } else {
          throw new Error(getException(segment, JSON.stringify(current)))
        }
      }
    })
  }
}

export class BaseCollectionDriver<T extends CollectionScheme> implements CollectionDriver {
  private collections: { [model: string]: IndexedCollectionStore<object> } = {}
  public tables: BaseTableDriver<T>

  constructor(private dataScheme: DataScheme<T>) {
    this.tables = new BaseTableDriver(dataScheme)

    for (const model in dataScheme.collections) {
      this.collections[dataScheme.collections[model].name] = new IndexedCollectionStore(
        dataScheme.collections[model]
      )
    }
  }

  bootstrap(data: { [K in keyof T]: ExtractType<T[K]['model']>[] }) {
    for (const key in data) {
      this.collections[this.dataScheme.collections[key].name].initialize(data[key])
    }
  }

  async getAll({ model }: CollectionDriverParams.Model) {
    return this.collections[model].getAll()
  }

  async get({ model, id }: CollectionDriverParams.Record) {
    return this.collections[model].get(id)
  }

  async findOneBy({ model, filter }: CollectionDriverParams.Filter) {
    return this.collections[model].findOneBy(filter)
  }

  async findBy({ model, filter }: CollectionDriverParams.Filter) {
    return this.collections[model].findBy(filter)
  }

  async create({ model, data }: CollectionDriverParams.Create) {
    return this.collections[model].create(data)
  }

  async remove({ model, id }: CollectionDriverParams.Record) {
    return this.collections[model].remove(id)
  }

  async update({ model, id, patches }: CollectionDriverParams.Update) {
    return this.collections[model].update(id, patches)
  }

  async exists({ model, id }: CollectionDriverParams.Record) {
    return this.collections[model].exists(id)
  }

  async existsBy({ model, filter }: CollectionDriverParams.Filter) {
    return this.collections[model].existsBy(filter)
  }

  async count({ model }: CollectionDriverParams.Model) {
    return this.collections[model].count()
  }
}

export const createBaseDriver = <T extends CollectionScheme>(dataScheme: DataScheme<T>) => {
  return new BaseCollectionDriver(dataScheme)
}
