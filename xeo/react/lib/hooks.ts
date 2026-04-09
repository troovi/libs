import { useCallback, useRef, useSyncExternalStore } from 'react'
import {
  BaseCollectionDriver,
  CollectionScheme,
  Collections,
  DataSource,
  DeepPartial,
  ExtractType,
  IType
} from '@companix/xeo-scheme'
import { createEntityProxy, shouldUpdateEntity } from './internals'
import { ReactionService } from './reaction'
import { MutationEvent } from './types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// prettier-ignore
type ModelType<Scheme extends CollectionScheme, K extends keyof Scheme> = ExtractType<Scheme[K]['model']>
type IdType<Scheme extends CollectionScheme, K extends keyof Scheme> = Scheme[K]['identifierType']

export interface Filter<T> {
  filter?: (item: T) => boolean
}

// ---------------------------------------------------------------------------
// createStore
// ---------------------------------------------------------------------------

export const createDataSourceHooks = <Scheme extends CollectionScheme>(
  dataSource: DataSource<Scheme, BaseCollectionDriver<Scheme>>
) => {
  const reactions = new ReactionService(dataSource)

  const getCollection = <K extends keyof Scheme>(collection: K): Collections<Scheme, 'sync'>[K] => {
    return dataSource.collections[collection]
  }

  // -------------------------------------------------------------------------
  // useReactive — shared subscribe + version-tracking primitive
  // -------------------------------------------------------------------------

  const useReactive = (collectionName: keyof Scheme, canUpdate: (event: MutationEvent) => boolean) => {
    const stateVersionRef = useRef(Symbol())
    const canUpdateRef = useRef(canUpdate)

    canUpdateRef.current = canUpdate

    const modelName = dataSource.scheme.collections[collectionName].name

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return reactions.subscribe(modelName, (event) => {
          if (canUpdateRef.current(event)) {
            stateVersionRef.current = Symbol()
            onStoreChange()
          }
        })
      },
      [modelName]
    )

    useSyncExternalStore(subscribe, () => stateVersionRef.current)
  }

  // -------------------------------------------------------------------------
  // useEntity — single entity by id, field-level tracking
  // -------------------------------------------------------------------------

  // prettier-ignore
  const useEntity = <K extends keyof Scheme>(collection: K, id?: IdType<Scheme, K>): ModelType<Scheme, K> | null => {
    const fieldsRef = useRef(new Set<string>())
    fieldsRef.current = new Set<string>()

    useReactive(collection, (event) => {
      if (event.type === 'update') {
        return event.id === id && shouldUpdateEntity(event, fieldsRef.current)
      }

      return false
    })

    const entity: ModelType<Scheme, K> | null = id === undefined ? null : getCollection(collection).get(id)
    return entity !== null ? createEntityProxy(entity, fieldsRef.current) : null
  }

  // prettier-ignore
  const useEntities = <K extends keyof Scheme>(collectionName: K, ids: IdType<Scheme, K>[], options: Filter<ModelType<Scheme, K>> = {}): ModelType<Scheme, K>[] => {
    const fieldsMapRef = useRef(new Map<IType, Set<string>>())
    const { filter = () => true } = options

    fieldsMapRef.current = new Map()

    useReactive(collectionName, (event) => {
      if (event.type === 'update') {
        return shouldUpdateEntity(event, fieldsMapRef.current.get(event.id) ?? new Set())
      }

      return false
    })

    const collection = getCollection(collectionName)
    const entities: ModelType<Scheme, K>[] = []

    for (const id of ids) {
      const entity = collection.get(id)

      if (entity && filter(entity)) {
        const fields = new Set<string>()
        fieldsMapRef.current.set(id, fields)
        entities.push(createEntityProxy(entity, fields))
      }
    }

    return entities
  }

  // -------------------------------------------------------------------------
  // useAll — getAll(), collection-level reactivity
  // -------------------------------------------------------------------------

  const useAll = <K extends keyof Scheme>(collectionName: K): ModelType<Scheme, K>[] => {
    const fieldsMapRef = useRef(new Map<IType, Set<string>>())
    fieldsMapRef.current = new Map()

    useReactive(collectionName, (event) => {
      if (event.type === 'create' || event.type === 'remove') {
        return true
      }

      return shouldUpdateEntity(event, fieldsMapRef.current.get(event.id) ?? new Set())
    })

    const idKey = dataSource.scheme.collections[collectionName].identifierKey

    return getCollection(collectionName)
      .getAll()
      .map((entity) => {
        const id = entity[idKey]
        const fields = new Set<string>()
        fieldsMapRef.current.set(id, fields)
        return createEntityProxy(entity, fields)
      })
  }

  // -------------------------------------------------------------------------
  // useFindBy — filter-based, collection-level reactivity
  // -------------------------------------------------------------------------

  // prettier-ignore
  const useFindBy = <K extends keyof Scheme>(collectionName: K, filter: DeepPartial<ModelType<Scheme, K>>): ModelType<Scheme, K>[] => {
    useReactive(collectionName, () => {
      return true
    })

    return getCollection(collectionName).findBy(filter)
  }

  // -------------------------------------------------------------------------
  // useFindOneBy — single entity by filter, collection-level reactivity
  // -------------------------------------------------------------------------

  // prettier-ignore
  const useFindOneBy = <K extends keyof Scheme>(collectionName: K, filter: DeepPartial<ModelType<Scheme, K>>): ModelType<Scheme, K> | null => {
    useReactive(collectionName, () => {
      return true
    })

    return getCollection(collectionName).findOneBy(filter)
  }

  // -------------------------------------------------------------------------
  // useField — single field of a single entity, minimal reactivity
  // -------------------------------------------------------------------------

  // prettier-ignore
  const useField = <K extends keyof Scheme, F extends keyof ModelType<Scheme, K>>(collectionName: K, id: IdType<Scheme, K>, field: F & string): ModelType<Scheme, K>[F] | null => {
    useReactive(collectionName, (event) => {
      if (event.type === 'update') {
        return event.id === id && shouldUpdateEntity(event, new Set([field]))
      }

      return false
    })

    const entity = getCollection(collectionName).get(id)
    
    return entity === null ? null : entity[field]
  }

  // -------------------------------------------------------------------------
  // useCount — scalar, create/remove reactivity only
  // -------------------------------------------------------------------------

  const useCount = <K extends keyof Scheme>(collectionName: K) => {
    useReactive(collectionName, (event) => {
      return event.type === 'create' || event.type === 'remove'
    })

    return getCollection(collectionName).count()
  }

  // -------------------------------------------------------------------------
  // useExists — scalar, targeted entity reactivity (create/remove only)
  // -------------------------------------------------------------------------

  const useExists = <K extends keyof Scheme>(collectionName: K, id: IdType<Scheme, K>) => {
    useReactive(collectionName, (event) => {
      return event.type === 'create' || event.type === 'remove'
    })

    return getCollection(collectionName).exists(id)
  }

  // -------------------------------------------------------------------------
  // useExistsBy — scalar, collection-level reactivity
  // -------------------------------------------------------------------------

  // prettier-ignore
  const useExistsBy = <K extends keyof Scheme>(collectionName: K, filter: DeepPartial<ModelType<Scheme, K>>) => {
    useReactive(collectionName, () => {
      return true
    })

    return getCollection(collectionName).existsBy(filter)
  }

  // -------------------------------------------------------------------------
  // mutations — non-reactive, just forwarded
  // -------------------------------------------------------------------------

  const useMutations = <K extends keyof Scheme>(collectionName: K) => {
    const collection = getCollection(collectionName)

    return {
      create: (model: ModelType<Scheme, K>) => {
        return collection.create(model)
      },
      update: (id: IdType<Scheme, K>, mutate: (draft: ModelType<Scheme, K>) => void) => {
        return collection.update(id, mutate)
      },
      remove: (id: IdType<Scheme, K>) => {
        return collection.remove(id)
      }
    }
  }

  return {
    useEntity,
    useEntities,
    useField,
    useAll,
    useFindBy,
    useFindOneBy,
    useCount,
    useExists,
    useExistsBy,
    useMutations
  }
}
