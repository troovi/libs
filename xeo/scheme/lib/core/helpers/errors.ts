import { IType } from '../data-processor'

interface NotExists {
  reason: 'NOT_EXISTS'
  refId: IType
}

interface Exists {
  reason: 'EXISTS'
  id: IType
}

interface RelationRestrict {
  reason: 'RELATION_RESTRICT'
  address: string
  info: RelationRestrictInfo
}

interface DependencyRestrict {
  reason: 'DEPENDENCY_RESTRICT'
  model: string
}

export type RelationRestrictInfo =
  | 'unique'
  | 'owner'
  | 'owner-fallback'
  | 'belongs-to'
  | 'has-many'
  | 'has-many >0'
  | 'has-many !== 0'
  | 'invalid discriminator'

export type CoreErrorData = Exists | NotExists | RelationRestrict | DependencyRestrict

export class CoreError {
  constructor(public model: string, public data: CoreErrorData) {}
}
