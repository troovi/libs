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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// prettier-ignore
type ModelType<Scheme extends CollectionScheme, K extends keyof Scheme> = ExtractType<Scheme[K]['model']>
type IdType<Scheme extends CollectionScheme, K extends keyof Scheme> = Scheme[K]['identifierType']

// ---------------------------------------------------------------------------
// createStore
// ---------------------------------------------------------------------------

export const createDataSourceHooks = <Scheme extends CollectionScheme>(
  dataSource: DataSource<Scheme, BaseCollectionDriver<Scheme>>
) => {
  const reactions = new ReactionService(dataSource)

  const getModelName = <K extends keyof Scheme>(collection: K) => {
    return dataSource.scheme.collections[collection].name
  }

  const getCollection = <K extends keyof Scheme>(collection: K): Collections<Scheme, 'sync'>[K] => {
    return dataSource.collections[collection]
  }

  // -------------------------------------------------------------------------
  // useEntity — single entity by id, field-level tracking
  // -------------------------------------------------------------------------

  // prettier-ignore
  const useEntity = <K extends keyof Scheme>(collection: K, id?: IdType<Scheme, K>): ModelType<Scheme, K> | null => {
    const fieldsRef = useRef(new Set<string>())
    const stateVersionRef = useRef(Symbol())

    fieldsRef.current = new Set<string>()

    const subscribe = useCallback((onStoreChange: () => void) => {
      return reactions.subscribe(getModelName(collection), (event) => {
        if (event.id === id && shouldUpdateEntity(event, fieldsRef.current)) {
          stateVersionRef.current = Symbol()
          onStoreChange()
        }
      })
    }, [id, collection])

    useSyncExternalStore(subscribe, () => stateVersionRef.current)

    const entity: ModelType<Scheme, K> | null = id === undefined ? null : getCollection(collection).get(id)
    return entity !== null ? createEntityProxy(entity, fieldsRef.current) : null
  }

  // prettier-ignore
  const useEntities = <K extends keyof Scheme>(collectionName: K, ids: IdType<Scheme, K>[]): ModelType<Scheme, K>[] => {
    const stateVersionRef = useRef(Symbol())
    const fieldsMapRef = useRef(new Map<IType, Set<string>>())

    fieldsMapRef.current = new Map()

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return reactions.subscribe(getModelName(collectionName), (event) => {
          if (event.type === 'update') {
            const trackedFields = fieldsMapRef.current.get(event.id) ?? new Set<string>()

            if (shouldUpdateEntity(event, trackedFields)) {
              stateVersionRef.current = Symbol()
              onStoreChange()
            }
          }
        })
      },
      [collectionName]
    )

    useSyncExternalStore(subscribe, () => stateVersionRef.current)

    const collection = getCollection(collectionName)
    const entities: ModelType<Scheme, K>[] = []

    for (const id of ids) {
      const entity = collection.get(id)

      if (entity) {
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
    const stateVersionRef = useRef(Symbol())
    const fieldsMapRef = useRef(new Map<IType, Set<string>>())

    fieldsMapRef.current = new Map()

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return reactions.subscribe(getModelName(collectionName), (event) => {
          if (event.type === 'create' || event.type === 'remove') {
            stateVersionRef.current = Symbol()
            onStoreChange()
            return
          }

          if (event.type === 'update') {
            const trackedFields = fieldsMapRef.current.get(event.id) ?? new Set<string>()

            if (shouldUpdateEntity(event, trackedFields)) {
              stateVersionRef.current = Symbol()
              onStoreChange()
            }
          }
        })
      },
      [collectionName]
    )

    useSyncExternalStore(subscribe, () => stateVersionRef.current)

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

  const useFindBy = <K extends keyof Scheme>(
    collectionName: K,
    filter: DeepPartial<ModelType<Scheme, K>>
  ): ModelType<Scheme, K>[] => {
    const stateVersionRef = useRef(Symbol())

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return reactions.subscribe(getModelName(collectionName), () => {
          stateVersionRef.current = Symbol()
          onStoreChange()
        })
      },
      [collectionName]
    )

    useSyncExternalStore(subscribe, () => stateVersionRef.current)

    return getCollection(collectionName).findBy(filter)
  }

  // -------------------------------------------------------------------------
  // useFindOneBy — single entity by filter, collection-level reactivity
  // -------------------------------------------------------------------------

  const useFindOneBy = <K extends keyof Scheme>(
    collectionName: K,
    filter: DeepPartial<ModelType<Scheme, K>>
  ): ModelType<Scheme, K> | null => {
    const stateVersionRef = useRef(Symbol())

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return reactions.subscribe(getModelName(collectionName), () => {
          stateVersionRef.current = Symbol()
          onStoreChange()
        })
      },
      [collectionName]
    )

    useSyncExternalStore(subscribe, () => stateVersionRef.current)

    return getCollection(collectionName).findOneBy(filter)
  }

  // -------------------------------------------------------------------------
  // useCount — scalar, create/remove reactivity only
  // -------------------------------------------------------------------------

  const useCount = <K extends keyof Scheme>(collectionName: K) => {
    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return reactions.subscribe(getModelName(collectionName), (event) => {
          if (event.type === 'create' || event.type === 'remove') {
            onStoreChange()
          }
        })
      },
      [collectionName]
    )

    return useSyncExternalStore(subscribe, () => getCollection(collectionName).count())
  }

  // -------------------------------------------------------------------------
  // useExists — scalar, targeted entity reactivity (create/remove only)
  // -------------------------------------------------------------------------

  const useExists = <K extends keyof Scheme>(collectionName: K, id: IdType<Scheme, K>) => {
    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return reactions.subscribe(getModelName(collectionName), (event) => {
          if (event.id === id && event.type !== 'update') {
            onStoreChange()
          }
        })
      },
      [collectionName, id]
    )

    return useSyncExternalStore(subscribe, () => getCollection(collectionName).exists(id))
  }

  // -------------------------------------------------------------------------
  // useExistsBy — scalar, collection-level reactivity
  // -------------------------------------------------------------------------

  const useExistsBy = <K extends keyof Scheme>(
    collectionName: K,
    filter: DeepPartial<ModelType<Scheme, K>>
  ) => {
    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        return reactions.subscribe(getModelName(collectionName), () => onStoreChange())
      },
      [collectionName]
    )

    return useSyncExternalStore(subscribe, () => getCollection(collectionName).existsBy(filter))
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
    useAll,
    useFindBy,
    useFindOneBy,
    useCount,
    useExists,
    useExistsBy,
    useMutations
  }
}
