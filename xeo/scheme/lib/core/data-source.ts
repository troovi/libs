import { xRay } from '../utils/x-ray'
import { __DEV__, ExtractType } from '../utils'

import { DataProcessor, IType } from './data-processor'
import { DataScheme, CollectionScheme } from './data-scheme'
import { CollectionDriver } from './types/driver.types'

interface CollectionApi<T = object, I extends IType = IType> {
  getAll: () => Promise<T[]>
  get: (id: I) => Promise<T | null>
  create: (model: T) => Promise<void>
  remove: (id: I) => Promise<void>
  update: (id: I, mutate: (model: T) => void) => void
}

interface DataSourceOptions<Scheme extends CollectionScheme, Driver extends CollectionDriver> {
  createDriver: (dataScheme: DataScheme<Scheme>) => Driver
}

export class DataSource<
  Scheme extends CollectionScheme,
  Driver extends CollectionDriver = CollectionDriver
> {
  public driver: Driver
  public collections = {} as {
    [K in keyof Scheme]: CollectionApi<ExtractType<Scheme[K]['model']>, Scheme[K]['identifierType']>
  }

  constructor(dataScheme: DataScheme<Scheme>, { createDriver }: DataSourceOptions<Scheme, Driver>) {
    const driver = createDriver(dataScheme)
    const processor = new DataProcessor(dataScheme, driver)

    if (__DEV__) {
      xRay.print('dataScheme')(dataScheme)
    }

    this.driver = driver

    for (const name in dataScheme.collections) {
      const collection = dataScheme.collections[name]

      const api: CollectionApi = {
        getAll: async () => {
          return driver.getAll({ model: collection.name })
        },
        get: async (id) => {
          return driver.get({ model: collection.name, id })
        },
        create: async (data) => {
          return processor.create(data, collection.name)
        },
        remove: (id) => {
          return processor.remove(id, collection.name)
        },
        update: (id, mutate) => {
          return processor.update(id, collection.name, mutate)
        }
      }

      this.collections[name] = api as CollectionApi<any>
    }
  }
}
