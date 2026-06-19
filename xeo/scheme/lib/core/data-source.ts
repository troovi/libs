import { xRay } from '../utils/x-ray'
import { __DEV__, DeepPartial, ExtractType, Promisify } from '../utils'

import { DataProcessor, IType } from './data-processor'
import { DataScheme, CollectionScheme, DiscriminatedMeta } from './data-scheme'
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
  update: (id: I, mutate: (model: T) => void) => Promise<boolean>
  create: (model: T) => Promise<boolean>
  remove: (id: I) => Promise<boolean>
  getExternalRelations: (id: I) => Promise<{ model: string; ids: IType[] }[]>
}

type CollectionApiShape = {
  [K in keyof CollectionApi]: (...params: Parameters<CollectionApi[K]>) => unknown
}

// ─── расширение API для дискриминированных коллекций ───

// все значения дискриминатора (literal union) из объединения вариантов VU по ключу DK
type DiscriminatorValues<VU, DK extends PropertyKey> = VU extends Record<DK, infer V> ? V : never
// конкретный вариант VU, у которого DK === NV
type VariantByValue<VU, DK extends PropertyKey, NV> = VU extends Record<DK, NV> ? VU : never

// prettier-ignore
export type DiscriminatedApi<B, VU, DK extends PropertyKey, I extends IType = IType> = {
  // patch — поля ТОЛЬКО новой формы (всё, что есть у целевого варианта сверх базы B);
  // id и сам дискриминатор задаются отдельно и не входят в патч
  changeDiscriminator: <NV extends DiscriminatorValues<VU, DK>>(
    id: I,
    nextValue: NV,
    patch: Omit<VariantByValue<VU, DK, NV>, keyof B>
  ) => Promise<boolean>
}

// если у коллекции есть discriminated-метаинформация — подмешиваем DiscriminatedApi
// prettier-ignore
type DiscriminatedExtension<C, I extends IType> =
  C extends { discriminated: DiscriminatedMeta<infer B, infer VU, infer DK> }
    ? DiscriminatedApi<B, VU, DK, I>
    : unknown

interface DataSourceOptions<Scheme extends CollectionScheme, Driver extends AppCollectionDriver> {
  createDriver: (dataScheme: DataScheme<Scheme>) => Driver
}

export type Collections<Scheme extends CollectionScheme, DT extends DriverType = DriverType> = {
  [K in keyof Scheme]: CollectionApi<ExtractType<Scheme[K]['model']>, Scheme[K]['identifierType'], DT> &
    DiscriminatedExtension<Scheme[K], Scheme[K]['identifierType']>
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
        getExternalRelations: (id) => {
          return processor.getExternalRelations(id, collection.name)
        }
      }

      // changeDiscriminator существует в рантайме у всех коллекций, но в типах открыт только у
      // дискриминированных (см. DiscriminatedExtension); на обычной коллекции бросит CoreError
      const api = {
        ...base,
        changeDiscriminator: (id: IType, nextValue: string, patch: object) => {
          return processor.changeDiscriminator(id, collection.name, nextValue, patch)
        }
      }

      ;(this.collections as Record<string, unknown>)[name] = api
    }
  }
}
