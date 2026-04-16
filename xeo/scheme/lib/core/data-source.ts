import { xRay } from '../utils/x-ray'
import { __DEV__, DeepPartial, ExtractType, Promisify } from '../utils'

import { DataProcessor, IType } from './data-processor'
import { DataScheme, CollectionScheme } from './data-scheme'
import { AppCollectionDriver } from './types/driver.types'

export interface DriverApiMethods<T = object, I extends IType = IType> {
  get: (id: I) => T | null
  getAll: () => T[]
  findOneBy: (filter: DeepPartial<T>) => T | null
  findBy: (filter: DeepPartial<T>) => T[]
  existsBy: (filter: DeepPartial<T>) => boolean
  exists: (id: I) => boolean
  count: () => number
}

type DriverApiSync<T = object, I extends IType = IType> = DriverApiMethods<T, I>
type DriverApiAsync<T = object, I extends IType = IType> = Promisify<DriverApiMethods<T, I>>

type DriverType = 'sync' | 'async'

// prettier-ignore
export type DriverApi<T = object,I extends IType = IType, DT extends DriverType = DriverType> = DT extends 'sync' ? DriverApiSync<T, I> : DriverApiAsync<T, I>

// prettier-ignore
export type CollectionApi<T = object, I extends IType = IType, DT extends DriverType = DriverType> = DriverApi<T, I, DT> & {
  // data changing
  update: (id: I, mutate: (model: T) => void) => void
  create: (model: T) => Promise<void>
  remove: (id: I) => Promise<void>
  hasExternalRelations: (id: I) => Promise<boolean>
}

type CollectionApiShape = {
  [K in keyof CollectionApi]: (...params: Parameters<CollectionApi[K]>) => unknown
}

interface DataSourceOptions<Scheme extends CollectionScheme, Driver extends AppCollectionDriver> {
  createDriver: (dataScheme: DataScheme<Scheme>) => Driver
}

export type Collections<Scheme extends CollectionScheme, DT extends DriverType = DriverType> = {
  [K in keyof Scheme]: CollectionApi<ExtractType<Scheme[K]['model']>, Scheme[K]['identifierType'], DT>
}

// prettier-ignore
export class DataSource<Scheme extends CollectionScheme, Driver extends AppCollectionDriver = AppCollectionDriver> {
  public driver: Driver
  public scheme: DataScheme<Scheme>
  public collections = {} as Collections<Scheme, Driver['type']>

  constructor(dataScheme: DataScheme<Scheme>, { createDriver }: DataSourceOptions<Scheme, Driver>) {
    const driver = createDriver(dataScheme)
    const processor = new DataProcessor(dataScheme, driver)

    if (__DEV__) {
      xRay.print('dataScheme')(dataScheme)
    }

    this.driver = driver
    this.scheme = dataScheme

    for (const name in dataScheme.collections) {
      const collection = dataScheme.collections[name]

      const base: CollectionApiShape = {
        // driver methods
        getAll: () => {
          return driver.getAll({ model: collection.name })
        },
        get: (id) => {
          return driver.get({ model: collection.name, id })
        },
        findOneBy: (filter) => {
          return driver.findOneBy({ model: collection.name, filter })
        },
        findBy: (filter) => {
          return driver.findBy({ model: collection.name, filter })
        },
        existsBy: (filter) => {
          return driver.existsBy({ model: collection.name, filter })
        },
        exists: (id) => {
          return driver.exists({ model: collection.name, id })
        },
        count: () => {
          return driver.count({ model: collection.name })
        },
        // data changing
        create: (data) => {
          return processor.create(data, collection.name)
        },
        remove: (id) => {
          return processor.remove(id, collection.name)
        },
        update: (id, mutate) => {
          return processor.update(id, collection.name, mutate)
        },
        hasExternalRelations: (id) => {
          return processor.hasExternalRelations(id, collection.name)
        }
      }

      this.collections[name] = base as CollectionApi<any, any, Driver['type']>
    }
  }
}
