import {
  InverseRefsTypes,
  ReferenceScheme,
  TargetReferencesStore,
  TargetRefsTypes
} from './types/refscheme.types'
import {
  ModelProperties,
  ModelScheme,
  PropertyMetadata,
  PropertyRelation,
  TypeMetadataStorage
} from '../storages/metadata.storage'
import { IType } from './data-processor'
import { KeyOfType, Type } from '../utils'
import { RelationsTableInfo } from './types/driver.types'

interface RelationInfo {
  relationPath: string
  relation: PropertyRelation
}

interface ReferenceParams {
  model: string
  relationPath: string
  relation: PropertyRelation
}

export interface PropertyMap {
  [name: string]: string | PropertyMap
}

export interface ModelMap {
  common: PropertyMap
  discriminators?: { [value: string]: PropertyMap }
}

export interface CollectionInfo<T, K extends KeyOfType<T, IType> = KeyOfType<T, IType>> {
  model: Type<T>
  name: string
  identifierKey: K
  identifierType: T[K]
}

export interface CollectionScheme {
  [name: string]: CollectionInfo<any>
}

export interface ModelData {
  scheme: ModelScheme
  refscheme: ReferenceScheme
  map: ModelMap
}

export type InferScheme<T extends DataScheme<CollectionScheme>> = T extends DataScheme<infer P>
  ? P
  : never

export class DataScheme<T extends CollectionScheme> {
  public metadata = TypeMetadataStorage

  public models: { [model: string]: ModelData } = {}
  public tables: RelationsTableInfo[] = []

  constructor(public collections: T) {
    const buffer: { model: string; fields: ModelProperties; target: TargetReferencesStore }[] = []

    // initialize data sources
    this.metadata.getModels().forEach((scheme) => {
      this.models[scheme.name] = {
        scheme,
        refscheme: { commonRefs: {}, inverseRefs: [] },
        map: { common: this.createPropertiesMap(scheme) }
      }

      const modelRef = this.models[scheme.name].refscheme
      const modelMap = this.models[scheme.name].map

      buffer.push({
        fields: scheme,
        target: modelRef.commonRefs,
        model: scheme.name
      })

      if (scheme.type === 'discriminated') {
        modelRef.discriminatorRefs = {}
        modelMap.discriminators = {}

        scheme.discriminators.forEach((discriminator) => {
          modelRef.discriminatorRefs![discriminator.value] = {}
          modelMap.discriminators![discriminator.value] = this.createPropertiesMap(discriminator)

          buffer.push({
            fields: discriminator,
            target: modelRef.discriminatorRefs![discriminator.value],
            model: scheme.name
          })
        })
      }
    })

    // call relation after all models was initiated
    buffer.forEach(({ model, fields, target }) => {
      this.getRelationsProperties(fields, ({ relationPath, relation }) => {
        const targetType = this.getTargetRef({
          model,
          relationPath,
          relation
        })

        const inverseType = this.getInverseRef({
          model,
          relationPath,
          relation
        })

        target[relationPath] = targetType

        if (inverseType) {
          const inverseModel = this.metadata.getModelSchemaByTarget(relation.referenceModel)
          this.models[inverseModel.name].refscheme.inverseRefs.push(inverseType)
        }

        if (relation.refType === 'reference-to' || relation.refType === 'reference-set') {
          this.tables.push(this.getRelationsTableInfo({ model, relationPath, relation }))
        }
      })
    })
  }

  // prettier-ignore
  private getRelationsProperties({ properties, references }: ModelProperties, cb: (info: RelationInfo) => void) {
    this.getEmbeddedRelationsProperties(properties, cb)

    references.forEach((relation) => {
      cb({ relationPath: relation.propertyKey, relation })
    })
  }

  // prettier-ignore
  private getEmbeddedRelationsProperties(properties: PropertyMetadata[], cb: (info: RelationInfo) => void, basePath: string[] = []) {
    properties.forEach(({ primitive, propertyKey }) => {
      if (primitive.type === 'embedded') {
        primitive.references.forEach((relation) => {
          cb({ relationPath: [...basePath, propertyKey, relation.propertyKey].join('.'), relation })
        })

        this.getEmbeddedRelationsProperties(primitive.properties, cb, [...basePath, propertyKey])
      }
    })
  }

  private getTargetRef(params: ReferenceParams): TargetRefsTypes {
    const { relation } = params

    switch (relation.refType) {
      case 'reference-set': {
        return {
          refType: 'reference-set',
          model: this.metadata.getModelSchemaByTarget(relation.referenceModel).name,
          tableName: this.getRelationsTableInfo(params).tableName,
          cascadeCleanup: relation.options?.cascadeCleanup ?? false
        }
      }
      case 'reference-to': {
        return {
          refType: 'reference-to',
          model: this.metadata.getModelSchemaByTarget(relation.referenceModel).name,
          tableName: this.getRelationsTableInfo(params).tableName,
          // prettier-ignore
          nullable: relation.options?.onRefDeleting === 'set-null' || (relation.options?.onRefDeleting === 'restrict' && (relation.options.nullable ?? false))
        }
      }
      case 'belongs-to': {
        const propertiesMap = this.getProperiesMap(relation.referenceModel)
        const inverseSideProperty = relation.inverseSideProperty(propertiesMap)
        const referenceModel = this.metadata.getModelSchemaByTarget(relation.referenceModel)
        const modelDiscriminatorValue = this.getDiscriminatorValue(
          referenceModel,
          relation.referenceModel()
        )

        return {
          refType: 'belongs-to',
          model: referenceModel.name,
          modelDiscriminatorValue,
          modelHasManyProperty: inverseSideProperty
        }
      }
      case 'has-many': {
        const propertiesMap = this.getProperiesMap(relation.referenceModel)
        const inverseSideProperty = relation.inverseSideProperty(propertiesMap)
        const referenceModel = this.metadata.getModelSchemaByTarget(relation.referenceModel)
        const modelDiscriminatorValue = this.getDiscriminatorValue(
          referenceModel,
          relation.referenceModel()
        )

        return {
          refType: 'has-many',
          model: referenceModel.name,
          cleanupBehavior: relation.options?.cleanupBehavior ?? 'restrict',
          modelDiscriminatorValue,
          modelBelongsToProperty: inverseSideProperty
        }
      }
      case 'owner': {
        return {
          model: this.metadata.getModelSchemaByTarget(relation.referenceModel).name,
          refType: 'owner'
        }
      }
      case 'owner-fallback': {
        return {
          model: this.metadata.getModelSchemaByTarget(relation.referenceModel).name,
          refType: 'owner-fallback'
        }
      }
    }
  }

  private getInverseRef(params: ReferenceParams): InverseRefsTypes | null {
    const { relation, model, relationPath } = params

    switch (relation.refType) {
      case 'reference-set': {
        return {
          refType: 'reference-set',
          model: model,
          onDeleteBehavior: relation.options?.onRefDeleting ?? 'unlink',
          modelConsumerProperty: relationPath,
          tableName: this.getRelationsTableInfo(params).tableName
        }
      }
      case 'reference-to': {
        return {
          refType: 'reference-to',
          model: model,
          onDeleteBehavior: relation.options?.onRefDeleting ?? 'restrict',
          modelConsumerProperty: relationPath,
          tableName: this.getRelationsTableInfo(params).tableName
        }
      }
      default: {
        return null
      }
    }
  }

  private getRelationsTableInfo(params: ReferenceParams): RelationsTableInfo {
    const { model, relation, relationPath } = params

    const reference = this.metadata.getModelSchemaByTarget(relation.referenceModel)

    return {
      tableName: `refs_${model}_and_${reference.name}_${relationPath.replaceAll('.', '_')}`,
      rules: {
        m1: model,
        m2: reference.name
      }
    }
  }

  private getDiscriminatorValue(referenceModel: ModelScheme, refTarget: Function) {
    if (referenceModel.type === 'discriminated') {
      if (refTarget !== referenceModel.target) {
        const discriminator = referenceModel.discriminators.find(
          (discriminator) => discriminator.target === refTarget
        )

        if (!discriminator) {
          throw new Error(`Discriminator not found for: ${referenceModel.name}`)
        }

        return discriminator.value
      }
    }

    return null
  }

  /**
   * Creates a special object - all columns and relations of the object (plus columns and relations from embeds)
   * in a special format - { propertyName: propertyName }.
   *
   * example: Post{ id: number, name: string, counterEmbed: { count: number }, category: Category }.
   * This method will create following object:
   * { id: "id", counterEmbed: { count: "counterEmbed.count" }, category: "category" }
   */
  private createPropertiesMap(fields: ModelProperties, basePath: string[] = []): PropertyMap {
    const { properties, references } = fields
    const map: PropertyMap = {}

    for (const { primitive, propertyKey } of properties) {
      const propertyPath = [...basePath, propertyKey].join('.')

      if (primitive.type === 'embedded') {
        map[propertyKey] = this.createPropertiesMap(primitive, [...basePath, propertyKey])
        continue
      }

      map[propertyKey] = propertyPath
    }

    for (const { propertyKey } of references) {
      map[propertyKey] = [...basePath, propertyKey].join('.')
    }

    return map
  }

  private getProperiesMap(ref: () => Function) {
    const referenceModel = this.metadata.getModelSchemaByTarget(ref)
    const map = this.models[referenceModel.name].map

    if (referenceModel.type === 'discriminated' && map.discriminators) {
      const discriminator = referenceModel.discriminators.find((discriminator) => {
        return discriminator.target === ref()
      })

      if (discriminator) {
        return { ...map.common, ...map.discriminators[discriminator.value] }
      }
    }

    return map.common
  }
}

// prettier-ignore
export const defineCollection = <T, K extends KeyOfType<T, IType>>(model: Type<T>, identifierKey: K): CollectionInfo<T, K> => {
  const data = TypeMetadataStorage.getModelSchemaByTarget(() => model)

  if(data.identifier.propertyKey !== identifierKey){
    throw new Error(`Provided ${identifierKey as string} not match with model ${data.identifier.propertyKey}`)
  }

  return { model, name: data.name, identifierType: {} as T[K], identifierKey }
}

export interface DiscriminatedCollectionOptions<B, D extends readonly Type<unknown>[], K> {
  baseScheme: Type<B>
  discriminators: D
  identifier: K
}

type DiscriminatedFrom<D extends readonly Type<unknown>[]> = D[number] extends Type<infer A> ? A : never

// prettier-ignore
export const defineDiscriminatedCollection = <B, K extends KeyOfType<B, IType>, D extends readonly Type<unknown>[]>(options: DiscriminatedCollectionOptions<B, D, K>) => {
  return defineCollection(
    options.baseScheme as Type<DiscriminatedFrom<D>>,
    options.identifier
  )
}
